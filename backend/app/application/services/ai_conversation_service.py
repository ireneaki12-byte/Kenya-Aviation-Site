"""Agentic travel assistant powered by Claude.

Architecture
────────────
1. Each request brings the full conversation history from the frontend.
2. We inject: today's date, retrieved RAG chunks, and tool definitions.
3. Claude reasons over the conversation and either replies with text OR
   calls one of our tools (search_flights, get_fares, navigate_to_summary …).
4. We execute any tool call, feed the result back, and let Claude continue
   until it produces a final text response.
5. If Claude called navigate_to_summary, we attach an `action` to the
   response so the frontend can set booking state and navigate to /summary.

This is an agentic loop: Claude decides which tool to call and when.
"""

import json
import os
from datetime import date, datetime

import anthropic
from sqlalchemy.orm import Session

from app.database.models import ChatLog
from app.domain import knowledge_base as kb
from app.infrastructure.repositories import postgres_repository as repo

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY is not set. Add it to your .env file."
            )
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


# ── Tool definitions ────────────────────────────────────────────────────────
TOOLS = [
    {
        "name": "search_flights",
        "description": (
            "Search for available flights. Call this once you know the origin, "
            "destination and departure date. For return trips also pass return_date."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "origin":         {"type": "string", "description": "IATA code, e.g. NBO"},
                "destination":    {"type": "string", "description": "IATA code, e.g. MBA"},
                "departure_date": {"type": "string", "description": "YYYY-MM-DD"},
                "trip_type":      {"type": "string", "enum": ["one-way", "return"], "default": "one-way"},
                "return_date":    {"type": "string", "description": "YYYY-MM-DD — only for return trips"},
                "adult":          {"type": "integer", "default": 1},
                "child":          {"type": "integer", "default": 0},
                "infant":         {"type": "integer", "default": 0},
            },
            "required": ["origin", "destination", "departure_date"],
        },
    },
    {
        "name": "get_flight_fares",
        "description": "Get the Basic and Fare Plus+ prices for a specific flight.",
        "input_schema": {
            "type": "object",
            "properties": {
                "flight_id": {"type": "string", "description": "Flight id from search_flights results"},
            },
            "required": ["flight_id"],
        },
    },
    {
        "name": "navigate_to_summary",
        "description": (
            "Call this when you have collected EVERYTHING needed to make a booking: "
            "outbound flight, fare, all passenger names/DOB/nationality/document, "
            "and contact details. This sends the completed booking state to the "
            "frontend and navigates the customer to the booking summary page where "
            "they can review and pay by themselves."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "selected_flight":        {"type": "object", "description": "Full flight object from search"},
                "selected_return_flight":  {"type": "object", "description": "Return leg flight object (if return trip)"},
                "selected_fare":          {"type": "object", "description": "Fare object {id, name, amount}"},
                "passengers": {
                    "type": "array",
                    "description": "Array of passenger objects",
                    "items": {
                        "type": "object",
                        "properties": {
                            "category":       {"type": "string"},
                            "title":          {"type": "string"},
                            "firstName":      {"type": "string"},
                            "lastName":       {"type": "string"},
                            "dateOfBirth":    {"type": "string"},
                            "nationality":    {"type": "string"},
                            "documentType":   {"type": "string"},
                            "documentNumber": {"type": "string"},
                        },
                    },
                },
                "contact_details": {
                    "type": "object",
                    "properties": {
                        "firstName": {"type": "string"}, "lastName": {"type": "string"},
                        "email":     {"type": "string"}, "phone":    {"type": "string"},
                        "country":   {"type": "string"}, "city":     {"type": "string"},
                    },
                },
                "search": {
                    "type": "object",
                    "description": "Search parameters including trip dates",
                    "properties": {
                        "departureDate": {"type": "string"},
                        "returnDate":    {"type": "string"},
                        "tripType":      {"type": "string"},
                        "origin":        {"type": "string"},
                        "destination":   {"type": "string"},
                    },
                },
            },
            "required": ["selected_flight", "selected_fare", "passengers", "contact_details"],
        },
    },
]

# ── System prompt ───────────────────────────────────────────────────────────
def _build_system_prompt(rag_docs: str) -> str:
    today  = date.today().isoformat()
    now    = datetime.now().strftime("%H:%M")
    weekday = datetime.now().strftime("%A")
    return f"""You are the Kenya Aviation virtual travel assistant. You help customers
search for flights and complete a full booking — collecting all required details
through natural conversation, then handing off to the payment page.

TODAY IS {weekday}, {today}. The current time is {now} EAT (East Africa Time).
When a customer says "tomorrow", "next week", or any relative date, calculate the
actual calendar date from today and use it.

AIRPORTS (IATA codes):
  NBO = Nairobi (Jomo Kenyatta), MBA = Mombasa, KIS = Kisumu,
  EDL = Eldoret, ZNZ = Zanzibar, DOH = Doha

HOW TO COMPLETE A BOOKING (agentic flow):
1. Understand the trip: origin, destination, date(s), trip type, passengers.
2. Call search_flights. Present the options clearly in a short list.
3. Ask the customer to pick a flight.
4. Call get_flight_fares for the chosen flight. Explain Basic vs Fare Plus+.
5. Ask the customer to choose a fare.
6. Collect each passenger's details one at a time:
   - Full name, date of birth, nationality, document type, document number.
   - For infants also ask which adult they travel with.
7. Collect contact details: full name, email, phone, city, country.
8. Confirm the full booking summary back to the customer.
9. Call navigate_to_summary with all collected data. The customer will then
   be taken to the summary page and can pay themselves.

RULES:
- Never make up flight numbers or prices — only use results from search_flights.
- Ask for one thing at a time. Be concise and friendly.
- If you don't know something, say so honestly.
- For policy questions, base your answers on the knowledge base below.
- Never process payment — always let the customer pay on the payment page.

{rag_docs}"""


# ── Tool execution ──────────────────────────────────────────────────────────
def _execute_tool(tool_name: str, tool_input: dict, db: Session) -> tuple[str, dict]:
    """Run a tool and return (text_result, action_or_empty_dict)."""

    if tool_name == "search_flights":
        origin      = tool_input["origin"].upper()
        destination = tool_input["destination"].upper()
        flights     = repo.search_flights(db, origin, destination)

        return_flights = []
        if tool_input.get("trip_type") == "return" and tool_input.get("return_date"):
            return_flights = repo.search_flights(db, destination, origin)

        payload = {"flights": flights, "return_flights": return_flights}
        return json.dumps(payload), {}

    if tool_name == "get_flight_fares":
        flight_id = tool_input["flight_id"]
        flight    = repo.get_flight(db, flight_id)
        if not flight:
            return json.dumps({"error": "Flight not found"}), {}
        fares = [
            {"id": "basic",     "name": "Basic",     "amount": flight["basic_fare"],
             "items": ["10 kg cabin", "Seat at a fee", "Standard change rules"]},
            {"id": "fare-plus", "name": "Fare Plus+", "amount": flight["plus_fare"],
             "items": ["10 kg cabin + 23 kg hold", "Free standard seat", "First change fee waived"]},
        ]
        return json.dumps({"fares": fares, "flight": flight}), {}

    if tool_name == "navigate_to_summary":
        # Add passengerKey and category to each passenger
        passengers = []
        for i, p in enumerate(tool_input.get("passengers", [])):
            p.setdefault("category", "adult")
            p["passengerKey"] = f"{p['category']}-{i+1}"
            p["label"] = f"{p['category'].title()} {i+1}"
            passengers.append(p)

        contact = tool_input.get("contact_details", {})
        contact.setdefault("title", "")
        contact.setdefault("confirmEmail", contact.get("email", ""))

        search_data = tool_input.get("search", {})

        action = {
            "type": "navigate",
            "page": "summary",
            "booking_state": {
                "selectedFlight":       tool_input.get("selected_flight"),
                "selectedReturnFlight": tool_input.get("selected_return_flight"),
                "selectedFare":         tool_input.get("selected_fare"),
                "passengerDetails":     passengers,
                "contactDetails":       contact,
                "search":               search_data,
            },
        }
        return json.dumps({"status": "booking_ready"}), action

    return json.dumps({"error": f"Unknown tool: {tool_name}"}), {}


# ── Main handle function ────────────────────────────────────────────────────
def handle_chat(
    db: Session,
    message: str,
    session_id: str = "default-session",
    conversation_history: list | None = None,
) -> dict:
    """Process one user turn. Returns {response, intent, action, context}."""

    # Retrieve relevant RAG docs
    rag_docs = kb.format_for_prompt(kb.retrieve(message, top_k=3))
    system   = _build_system_prompt(rag_docs)

    # Build message list for the API
    history = list(conversation_history or [])
    history.append({"role": "user", "content": message})

    client = _get_client()
    final_action: dict = {}

    # Agentic loop — keep going until Claude produces a text response
    while True:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            system=system,
            tools=TOOLS,
            messages=history,
        )

        if response.stop_reason == "end_turn":
            # Claude produced a final text response
            text_reply = next(
                (b.text for b in response.content if b.type == "text"), ""
            )
            break

        if response.stop_reason == "tool_use":
            # Claude wants to call a tool — execute it and loop
            history.append({"role": "assistant", "content": response.content})
            tool_results = []

            for block in response.content:
                if block.type != "tool_use":
                    continue
                result_text, action = _execute_tool(block.name, block.input, db)
                if action:
                    final_action = action
                tool_results.append({
                    "type":        "tool_result",
                    "tool_use_id": block.id,
                    "content":     result_text,
                })

            history.append({"role": "user", "content": tool_results})
            continue

        # Unexpected stop reason
        text_reply = "I encountered an unexpected issue. Please try again."
        break

    # Persist to the chat log
    try:
        log = ChatLog(
            session_id=session_id,
            message=message,
            intent="agentic",
            response=text_reply,
            outcome="action" if final_action else "text",
            timestamp=datetime.utcnow(),
        )
        db.add(log)
        db.commit()
    except Exception:
        pass

    return {
        "response":             text_reply,
        "intent":               "agentic",
        "action":               final_action or None,
        "updated_history":      history,
        "context":              {},
    }

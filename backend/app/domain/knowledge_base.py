"""
RAG knowledge base for Kenya Aviation.

Stores policy / FAQ documents as plain text chunks. On each chat turn the
service retrieves the most relevant chunks by keyword overlap and includes
them in the system prompt so the assistant's answers are grounded in your docs.

To extend: add more entries to DOCUMENTS. Each entry needs:
- id
- topic
- content
"""

from __future__ import annotations

import math
import re
from typing import TypedDict


class Document(TypedDict):
    id: str
    topic: str
    content: str


DOCUMENTS: list[Document] = [
    {
        "id": "fare-basic",
        "topic": "Basic fare",
        "content": """
The Basic fare includes 10 kg cabin baggage.
Seat selection is charged separately.
Standard change rules apply and changes attract a fee plus any fare difference.
Basic fare tickets are non-refundable unless a refund exception applies.
""",
    },
    {
        "id": "fare-plus-smart-fare",
        "topic": "Fare Plus / Smart Fare",
        "content": """
Fare Plus+, also referred to as Smart Fare, includes:
- 10 kg cabin baggage
- 23 kg checked baggage
- Free standard seat selection
- One date or time change fee waived, excluding fare difference

Fare difference still applies where the new flight is more expensive.
Smart Fare is not refundable.
Smart Fare is recommended for families and business travellers.
""",
    },
    {
        "id": "baggage-cabin",
        "topic": "Cabin baggage allowance",
        "content": """
All passengers are allowed one piece of hand luggage with a maximum weight of 10 kg.
The maximum cabin baggage dimensions are 55 cm x 35 cm x 25 cm.

If hand baggage exceeds the permitted dimensions, it may be accepted as checked baggage at a charge.
Passengers should check their hand baggage size using airport baggage sizers before proceeding to the departure area.

Infants not occupying a seat may also carry one piece of hand baggage up to 10 kg and a fully collapsible stroller.
""",
    },
    {
        "id": "baggage-hold",
        "topic": "Hold baggage and prepaid baggage rates",
        "content": """
Kenya Aviation does not provide a free checked baggage allowance on all fares.
Passengers may purchase up to two checked bags as required.

Prepaid baggage rates:
- 0 to 23 kg: KES 1,000
- 24 to 32 kg: KES 2,500

Airport baggage rates are double the published prepaid baggage rates.
Passengers are encouraged to book baggage in advance because unbooked or additional baggage at the airport is charged at a higher airport rate.
""",
    },
    {
        "id": "baggage-special",
        "topic": "Special baggage",
        "content": """
Special baggage includes items such as golf bags, bikes, surfboards, dive equipment, and musical instruments.

Special baggage may be accepted subject to size, weight, safety and operational restrictions.
The maximum length for sporting equipment such as a surfboard, hang glider or kiteboard is 3.60 metres.
Other hold luggage must not exceed 86 cm in height and 115 cm in width.

Musical instruments are generally transported in the cargo hold at the standard hold luggage rate.
Small musical instruments may be carried as hand luggage only if they meet cabin baggage size and weight limits.
""",
    },
    {
        "id": "restricted-carry-on-items",
        "topic": "Restricted carry-on items",
        "content": """
Passengers are not allowed to carry the following in hand baggage:
- Knives, swords, pocket knives and hunting knives
- Scissors and sharp or bladed objects
- Weapons, whips, batons, stun guns, toy guns or look-alike weapons
- Sporting equipment such as bats, golf clubs, hockey sticks and billiard cues
- Spillable batteries
- Liquids, gels and aerosols above permitted security limits

Liquids, gels and aerosols in hand luggage must be in containers of up to 100 ml and placed in a transparent resealable plastic bag.
Medicine and baby food needed during the flight may be allowed subject to security screening.
""",
    },
    {
        "id": "electronic-devices",
        "topic": "Electronic devices on board",
        "content": """
Passengers must be able to activate electronic devices at the security checkpoint.
If a device cannot be switched on, it may need to be packed in checked baggage.

Cellular telephones must be switched off during the flight.
Permitted devices may include voice recorders, calculators, laptop computers, handheld CD players, handheld electronic devices, computer games and photographic equipment, subject to crew instructions.
""",
    },
    {
        "id": "checkin-online",
        "topic": "Online check-in",
        "content": """
Online check-in is available from 30 hours before flight departure.
Online check-in closes between 1 hour and 2 hours before departure depending on route and operating rules.

Passengers travelling with an infant or requiring special assistance may need to check in at the airport.
Passengers must carry identification that matches the booking name.
Boarding passes may be downloaded or sent by email depending on the check-in flow.
""",
    },
    {
        "id": "checkin-airport",
        "topic": "Airport check-in and terminal information",
        "content": """
For local travel from JKIA, passengers check in at Terminal 1D.
Local check-in counters open 2 hours before departure and close 40 minutes before departure.

For international travel from JKIA, passengers check in at Terminal 1A.
International check-in counters open 2.5 hours before departure and close 1 hour before departure.

Passengers should factor in traffic, baggage drop, airport security and payment for any airport ancillaries.
Airport ancillary payments should preferably be made electronically.
""",
    },
    {
        "id": "identification-documents",
        "topic": "Identification and travel documents",
        "content": """
For local travel, passengers must produce an acceptable form of identification at check-in.
Accepted local identification may include:
- National ID card
- Passport
- Valid driving licence
- Military card
- Alien card
- Birth certificate
- Police abstract where applicable

For international travel, passengers must carry valid passports and any required visas or health documents.
Yellow fever vaccination may be required for passengers travelling out of Kenya or arriving from/transiting through countries with yellow fever risk.
""",
    },
    {
        "id": "passenger-types",
        "topic": "Passenger categories and age rules",
        "content": """
Adults are passengers aged 16 years and above.
Children are passengers aged 2 to 15 years.
Infants are under 2 years old and usually travel on an adult's lap.
Infants pay 10% of the adult fare if they do not occupy a seat.
An infant must travel with an adult.

Unaccompanied minors are children travelling alone.
Kenya Aviation accepts unaccompanied minors between 5 and 14 years old, subject to prior arrangement.
For children aged 15 to 17 years, unaccompanied minor service may be requested voluntarily.
""",
    },
    {
        "id": "infant-policy",
        "topic": "Travelling with infants",
        "content": """
Infants up to 23 months may travel on an adult's lap or may occupy a separate seat if arranged through the call centre.
If an infant occupies a separate seat, the adult fare may apply.
Each adult aged 16 years or older may travel with a maximum of two infants, but only one infant may travel on the lap.
Newborn babies are not allowed to travel in a pressurised cabin until seven days after birth.
Kenya Aviation does not provide carrycots on board.
""",
    },
    {
        "id": "special-assistance",
        "topic": "Special assistance",
        "content": """
Customers may request:
- Mobility assistance
- Wheelchair support
- Visual impairment assistance
- Hearing impairment assistance
- Hidden disability support
- Unaccompanied minor handling

Passengers requiring special assistance should inform Kenya Aviation during booking or at least 48 hours before departure.
Special assistance is subject to prior arrangement and operational acceptance.
""",
    },
    {
        "id": "service-animals",
        "topic": "Service animals",
        "content": """
Kenya Aviation may accept service animals that are trained to support passengers with disabilities.
Service animals must be properly documented, harnessed, and must not occupy a passenger seat or block the aisle.
Passengers travelling with service animals should notify Kenya Aviation before booking.
Required documents may include health certificates, vaccination documents and movement permits.
Emotional support animals may require further profiling before acceptance.
""",
    },
    {
        "id": "meals",
        "topic": "Meal options",
        "content": """
Kenya Aviation offers onboard refreshments and meal options on selected flights.
Meal options may include:
- Tropical breakfast
- Vegetarian meal
- Child meal
- Premium coastal platter

Meals are selected during the add-ons step and may attract additional charges.
Passengers may carry solid cooked food if properly wrapped, but frozen food may need to be checked in.
""",
    },
    {
        "id": "payment-methods",
        "topic": "Payment methods",
        "content": """
Kenya Aviation accepts several payment methods including:
- Card payments
- Visa
- Mastercard
- M-Pesa
- Airtel Money
- Equitel
- Voucher or credit shell where applicable

Payment is collected at the end of the booking flow.
All amounts are shown in Kenyan Shillings unless otherwise stated.
""",
    },
    {
        "id": "routes",
        "topic": "Routes served",
        "content": """
Kenya Aviation serves domestic and regional destinations including:
- Nairobi
- Eldoret
- Kisumu
- Malindi
- Mombasa
- Ukunda
- Lamu
- Goma

Kenya Aviation is a point-to-point carrier and does not offer through connections.
Customers who need connecting journeys must book separate tickets and allow sufficient connection time.
Kenya Aviation is not liable for missed onward flights where separate bookings are made.
""",
    },
    {
        "id": "booking-confirmation",
        "topic": "Booking confirmation and ticketless travel",
        "content": """
Kenya Aviation is ticketless.
Customers receive a booking reference number and itinerary after booking.
At the airport, passengers should present their booking reference and valid identification.
If a customer cannot print a booking confirmation, they may present their ID or passport at the check-in counter.
""",
    },
    {
        "id": "changes-cancellations",
        "topic": "Changes, cancellations and credit shell",
        "content": """
Customers may change travel date, time, passenger name, origin or destination subject to fare rules and fees.
Changes can usually be made online or through the call centre up to 2 hours before departure.

Kenya Aviation tickets are generally non-refundable.
If a customer cancels, a cancellation fee may apply and the remaining value may be kept as credit under the same booking reference.
Credit may be valid for 12 months from cancellation date.

Refund exceptions may apply for airline delays, duplicate bookings, or passenger death with proof.
""",
    },
    {
        "id": "manage-booking",
        "topic": "Manage booking",
        "content": """
Customers may use Manage Booking to:
- Add a bag
- Select a seat
- Change a name
- View itinerary
- Resend itinerary
- Change time or date of travel where allowed

Customers may not use Manage Booking to:
- Reroute a booking
- Remove a seat
- Remove a bag
- Cancel a booking
- Add a passenger
- Add special service requests such as infant or golf equipment
""",
    },
    {
        "id": "refunds",
        "topic": "Refund policy",
        "content": """
Kenya Aviation tickets are generally non-refundable.
Refunds may be considered where:
- The airline has a delay of more than one hour
- There is a duplicate booking for the same passenger, date and route
- The passenger dies and proof of death is provided

Refund requests for taxes must include booking reference, passenger names and travel information.
Administration fees may apply.
""",
    },
    {
        "id": "taxes-fees",
        "topic": "Taxes and fees",
        "content": """
Applicable taxes, fees and charges imposed by government, airport authorities or other authorities are payable by the passenger.
Taxes and fees may change after ticket issuance.
If new taxes or charges are imposed, the passenger may be required to pay them.
If taxes or charges are reduced or abolished, the passenger may claim a refund where applicable.
""",
    },
    {
        "id": "customer-support",
        "topic": "Customer support contacts",
        "content": """
Customers may contact Kenya Aviation through the call centre:
+254711024545
+254734104545
+254 20 3274545

Group bookings may be handled through groups@kenya-aviation.com.
Charter enquiries may be sent to charters@kenya-aviation.com.
""",
    },
]


def _tokenize(text: str) -> list[str]:
    """Normalise text into searchable tokens."""
    return re.findall(r"[a-z0-9]+", text.lower())


def _score(query: str, doc: Document) -> float:
    """Simple keyword overlap score for deterministic capstone demo retrieval."""
    query_words = set(_tokenize(query))

    if not query_words:
        return 0.0

    target_words = _tokenize(f"{doc['topic']} {doc['content']}")

    if not target_words:
        return 0.0

    hits = sum(1 for word in target_words if word in query_words)

    return hits / math.log(len(target_words) + 2)


def retrieve(query: str, top_k: int = 3) -> list[Document]:
    """Return the top-k most relevant documents for the given query."""
    scored = [(doc, _score(query, doc)) for doc in DOCUMENTS]
    scored.sort(key=lambda item: item[1], reverse=True)

    return [doc for doc, score in scored[:top_k] if score > 0]


def format_for_prompt(docs: list[Document]) -> str:
    """Format retrieved documents for inclusion in the assistant system prompt."""
    if not docs:
        return ""

    lines = ["--- Kenya Aviation Knowledge Base ---"]

    for doc in docs:
        lines.append(f"\n[{doc['topic']}]\n{doc['content'].strip()}")

    lines.append("--- end of knowledge base ---")

    return "\n".join(lines)
"""Itinerary email — renders the HTML template and sends via SMTP.
Supports one-way and return trips, all passengers, and travel dates.
"""

import os
import smtplib
from datetime import datetime
from email.message import EmailMessage
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core import config

router = APIRouter()

TEMPLATE_PATH = os.getenv(
    "ITINERARY_TEMPLATE",
    os.path.join(os.path.dirname(__file__), "..", "..", "templates", "itinerary-email.html"),
)

CATEGORY_LABELS = {
    "adult":  "Adult",
    "child":  "Child",
    "infant": "Infant",
    "unmr":   "Unaccompanied Minor",
}


class ItineraryEmailRequest(BaseModel):
    booking:        dict      = {}
    flight:         dict      = {}
    returnFlight:   dict | None = None   # second leg for return trips
    search:         dict      = {}       # holds departureDate, returnDate
    fare:           dict      = {}
    passengers:     list[Any] = []
    contactDetails: dict      = {}
    addons:         dict      = {}


def _flight_segment_html(
    label: str,
    flight: dict,
    date: str,
    is_first: bool = True,
) -> str:
    """Render one flight segment (outbound or return) as an HTML table block."""
    border_top = "" if is_first else (
        '<tr><td style="padding:0 28px;">'
        '<div style="border-top:2px dashed #C9A84C; margin:0;"></div>'
        '</td></tr>'
    )
    return f"""
    {border_top}
    <tr>
      <td style="background:#fff; padding:{'24px' if is_first else '16px'} 28px 24px;">
        <div style="font-size:11px; font-weight:700; color:#6B1E2E; text-transform:uppercase;
                    letter-spacing:0.07em; margin-bottom:14px; border-bottom:2px solid #C9A84C;
                    padding-bottom:6px; display:flex; justify-content:space-between;
                    align-items:center;">
          <span>{label}</span>
          {f'<span style="font-size:10px; font-weight:600; color:#C9A84C; background:#FBF7ED; padding:2px 10px; border-radius:12px; border:1px solid #C9A84C;">{date}</span>' if date else ''}
        </div>

        <!-- Flight number + fare row -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
          <tr>
            <td width="50%" style="padding-right:8px;">
              <div style="font-size:9px; color:#C9A84C; font-weight:700; text-transform:uppercase;
                          letter-spacing:0.06em; margin-bottom:3px;">Flight</div>
              <div style="font-size:22px; font-weight:800; color:#4A1520;">
                {flight.get('flight_number', '—')}
              </div>
            </td>
            <td width="50%">
              <div style="font-size:9px; color:#C9A84C; font-weight:700; text-transform:uppercase;
                          letter-spacing:0.06em; margin-bottom:3px;">Date</div>
              <div style="font-size:14px; font-weight:700; color:#4A1520;">{date or '—'}</div>
            </td>
          </tr>
        </table>

        <!-- Route timeline -->
        <table width="100%" cellpadding="0" cellspacing="0"
               style="margin-bottom:20px; background:#FBF7ED; border-radius:8px;
                      padding:14px; border:1px solid #C9A84C;">
          <tr>
            <td width="38%" style="text-align:left;">
              <div style="font-size:9px; color:#888; margin-bottom:3px;">Departure</div>
              <div style="font-size:13px; font-weight:800; color:#4A1520;">
                {flight.get('departure_time', '—')}
              </div>
              <div style="font-size:10px; font-weight:700; color:#6B1E2E; margin-top:2px;">{date}</div>
              <div style="font-size:10px; color:#555; margin-top:4px;">{flight.get('origin', '—')}</div>
            </td>
            <td width="24%" style="text-align:center; color:#C9A84C; font-size:22px;">&#9992;</td>
            <td width="38%" style="text-align:right;">
              <div style="font-size:9px; color:#888; margin-bottom:3px;">Arrival</div>
              <div style="font-size:13px; font-weight:800; color:#4A1520;">
                {flight.get('arrival_time', '—')}
              </div>
              <div style="font-size:10px; font-weight:700; color:#6B1E2E; margin-top:2px;">{date}</div>
              <div style="font-size:10px; color:#555; margin-top:4px;">{flight.get('destination', '—')}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    """


def _build_passengers_table(passengers: list) -> str:
    if not passengers:
        return (
            '<tr><td colspan="4" style="font-size:12px; color:#888; padding:10px;">'
            "No passenger details captured.</td></tr>"
        )
    rows = []
    for i, p in enumerate(passengers, start=1):
        category  = p.get("category") or p.get("type") or "adult"
        label     = CATEGORY_LABELS.get(category, category.title())
        title     = p.get("title", "")
        first     = p.get("firstName") or p.get("first_name", "")
        last      = p.get("lastName")  or p.get("last_name", "")
        full_name = " ".join(filter(None, [title, first, last])) or "—"
        doc_type  = p.get("documentType")   or p.get("document_type", "")
        doc_num   = p.get("documentNumber") or p.get("document_number", "")
        doc       = f"{doc_type}: {doc_num}" if doc_type and doc_num else doc_type or "—"
        bg        = "#ffffff" if i % 2 == 0 else "#fdfbf8"
        rows.append(
            f'<tr style="background:{bg};">'
            f'<td style="font-size:11px; color:#888; padding:8px 10px; border-bottom:1px solid #f0ebe0;">{i}</td>'
            f'<td style="font-size:12px; font-weight:700; color:#4A1520; padding:8px 10px; border-bottom:1px solid #f0ebe0;">{full_name}</td>'
            f'<td style="font-size:11px; color:#6B1E2E; padding:8px 10px; border-bottom:1px solid #f0ebe0;">{label}</td>'
            f'<td style="font-size:11px; color:#555; padding:8px 10px; border-bottom:1px solid #f0ebe0;">{doc}</td>'
            f"</tr>"
        )
    return "\n".join(rows)


def _render(payload: ItineraryEmailRequest) -> str:
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as fh:
        html = fh.read()

    b       = payload.booking
    f       = payload.flight
    ret_f   = payload.returnFlight or {}
    search  = payload.search
    contact = payload.contactDetails
    addons  = payload.addons
    pax     = payload.passengers

    outbound_date = search.get("departureDate") or search.get("departure_date") or ""
    return_date   = search.get("returnDate")    or search.get("return_date")    or ""

    # Lead passenger name for greeting
    lead      = next(iter(pax), {}) if pax else {}
    lead_name = " ".join(filter(None, [
        lead.get("title", ""),
        lead.get("firstName") or lead.get("first_name", ""),
        lead.get("lastName")  or lead.get("last_name", ""),
    ])) or contact.get("firstName", "Traveller")

    total = b.get("totalAmount") or b.get("total") or 0

    # Build both flight segments
    outbound_html = _flight_segment_html("Outbound Flight" if ret_f else "Flight Information",
                                         f, outbound_date, is_first=True)
    return_html   = _flight_segment_html("Return Flight", ret_f, return_date, is_first=False) if ret_f else ""

    tokens = {
        "LEAD_PASSENGER_NAME": lead_name,
        "BOOKING_REF":         b.get("bookingReference") or b.get("pnr") or "",
        "OUTBOUND_SEGMENT":    outbound_html,
        "RETURN_SEGMENT":      return_html,
        "PASSENGERS_TABLE":    _build_passengers_table(pax),
        "FARE_NAME":           payload.fare.get("name", ""),
        "SEAT":    addons.get("seat") or "Not selected",
        "BAGGAGE": (addons.get("extraBaggage") or ["None"])[0],
        "MEAL":    addons.get("meal") or "None",
        "TOTAL":   f"KES {int(total):,}",
        "PAYMENT_METHOD": b.get("paymentMethod") or b.get("payment_method", ""),
        "CONTACT_EMAIL":  contact.get("email", ""),
        "CONTACT_PHONE":  contact.get("phone", ""),
        "YEAR":           str(datetime.now().year),
    }

    for key, value in tokens.items():
        html = html.replace(f"{{{{{key}}}}}", str(value))
    return html


@router.post("/itinerary", summary="Email the itinerary to the passenger")
def send_itinerary(payload: ItineraryEmailRequest):
    to_email = payload.contactDetails.get("email")
    if not to_email:
        raise HTTPException(status_code=400, detail="contactDetails.email is required")

    html = _render(payload)

    if not (config.SMTP_HOST and config.SMTP_USERNAME and config.SMTP_PASSWORD):
        print(f"[DEV EMAIL] itinerary -> {to_email} "
              f"({'return' if payload.returnFlight else 'one-way'}, "
              f"{len(payload.passengers)} passenger(s))")
        return {"sent": False, "dev_mode": True}

    msg = EmailMessage()
    msg["Subject"] = f"Your Kenya Aviation itinerary — {payload.booking.get('bookingReference', '')}"
    msg["From"]    = config.SMTP_FROM_EMAIL
    msg["To"]      = to_email
    msg.set_content("Please view this email in an HTML-capable email client.")
    msg.add_alternative(html, subtype="html")

    with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as server:
        server.starttls()
        server.login(config.SMTP_USERNAME, config.SMTP_PASSWORD)
        server.send_message(msg)

    return {"sent": True, "recipients": [to_email],
            "legs": 2 if payload.returnFlight else 1}

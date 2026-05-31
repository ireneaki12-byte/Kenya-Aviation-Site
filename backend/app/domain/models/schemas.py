from typing import Dict, Optional

from pydantic import BaseModel, EmailStr, Field  # type: ignore[reportMissingImports]


class PassengerCounts(BaseModel):
    adult: int = Field(1, ge=0, example=1)
    child: int = Field(0, ge=0, example=0)
    infant: int = Field(0, ge=0, example=0)
    unmr: int = Field(0, ge=0, example=0)


class FlightSearchRequest(BaseModel):
    trip_type: str = Field("one-way", example="one-way")
    origin: str = Field(..., example="NBO")
    destination: str = Field(..., example="MBA")
    departure_date: str = Field(..., example="2026-07-15")
    return_date: Optional[str] = Field(None, example="2026-07-20")
    passengers: PassengerCounts = Field(default_factory=PassengerCounts)


class PassengerDetailsRequest(BaseModel):
    title: str = Field(..., example="Ms")
    first_name: str = Field(..., example="Irene")
    middle_name: Optional[str] = Field("", example="A")
    last_name: str = Field(..., example="Baraki")
    date_of_birth: str = Field(..., example="1990-01-01")
    nationality: str = Field(..., example="Kenyan")
    document_type: str = Field(..., example="National ID")
    document_number: str = Field(..., example="12345678")


class ContactDetailsRequest(BaseModel):
    title: str = Field(..., example="Ms")
    first_name: str = Field(..., example="Irene")
    last_name: str = Field(..., example="Baraki")
    phone: str = Field(..., example="0712345678")
    email: EmailStr = Field(..., example="irene@example.com")
    confirm_email: EmailStr = Field(..., example="irene@example.com")
    address: Optional[str] = Field("", example="Nairobi")
    country: str = Field(..., example="Kenya")
    city: str = Field(..., example="Nairobi")


class BookingDraftRequest(BaseModel):
    flight_id: str = Field(..., example="FL-101")
    fare_type: str = Field(..., example="fare-plus")
    passengers: PassengerCounts = Field(default_factory=PassengerCounts)
    addons: Dict = Field(default_factory=dict)


class PaymentRequest(BaseModel):
    booking_reference: Optional[str] = Field(None, example="KAS7K9P")
    amount: int = Field(..., example=14250)
    method: str = Field(..., example="card")


class ChatRequest(BaseModel):
    message: str = Field(..., example="I want to fly from Nairobi to Mombasa tomorrow morning")
    session_id: Optional[str] = Field("default-session", example="CHAT-001")


class CheckInRequest(BaseModel):
    pnr: str = Field(..., example="KAS7K9P")
    last_name: str = Field(..., example="Passenger")


class BookingResponse(BaseModel):
    booking_reference: str
    status: str
    payment_status: str
    total_amount: int
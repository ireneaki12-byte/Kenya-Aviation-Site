from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text  # type: ignore[import]
from sqlalchemy.orm import relationship  # type: ignore[import]
from datetime import datetime

from app.database.connection import Base


class Airport(Base):
    __tablename__ = "airports"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, nullable=False, index=True)
    city = Column(String(100), nullable=False)
    name = Column(String(200), nullable=False)
    country = Column(String(100), nullable=False)
    terminal = Column(String(100), nullable=True)


class Route(Base):
    __tablename__ = "routes"

    id = Column(String(50), primary_key=True, index=True)
    origin = Column(String(10), nullable=False)
    destination = Column(String(10), nullable=False)
    active = Column(Boolean, default=True)


class Flight(Base):
    __tablename__ = "flights"

    id = Column(String(50), primary_key=True, index=True)
    flight_number = Column(String(50), nullable=False)
    origin = Column(String(10), nullable=False)
    destination = Column(String(10), nullable=False)
    departure_time = Column(String(20), nullable=False)
    arrival_time = Column(String(20), nullable=False)
    duration = Column(String(50), nullable=False)
    aircraft = Column(String(100), nullable=True)
    terminal = Column(String(100), nullable=True)
    gate = Column(String(50), nullable=True)
    seats_available = Column(Integer, default=0)
    basic_fare = Column(Integer, nullable=False)
    plus_fare = Column(Integer, nullable=False)


class FarePackage(Base):
    __tablename__ = "fare_packages"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    included_cabin_baggage_kg = Column(Integer, default=0)
    included_hold_baggage_kg = Column(Integer, default=0)
    free_standard_seat = Column(Boolean, default=False)
    first_change_fee_waived = Column(Boolean, default=False)


class Seat(Base):
    __tablename__ = "seats"

    id = Column(Integer, primary_key=True, index=True)
    flight_id = Column(String(50), ForeignKey("flights.id"), nullable=False)
    seat_number = Column(String(10), nullable=False)
    seat_type = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    price = Column(Integer, default=0)


class AddOn(Base):
    __tablename__ = "addons"

    id = Column(String(50), primary_key=True, index=True)
    category = Column(String(100), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Integer, default=0)
    chargeable = Column(Boolean, default=True)
    available = Column(Boolean, default=True)


class Booking(Base):
    __tablename__ = "bookings"

    pnr = Column(String(20), primary_key=True, index=True)
    status = Column(String(50), nullable=False, default="Draft")
    payment_status = Column(String(50), nullable=False, default="Not Paid")
    payment_reference = Column(String(100), nullable=True)
    total = Column(Integer, default=0)

    flight_id = Column(String(50), ForeignKey("flights.id"), nullable=True)
    fare_type = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    passengers = relationship("Passenger", back_populates="booking")
    contact = relationship("Contact", uselist=False, back_populates="booking")
    payments = relationship("Payment", back_populates="booking")


class Passenger(Base):
    __tablename__ = "passengers"

    id = Column(Integer, primary_key=True, index=True)
    booking_pnr = Column(String(20), ForeignKey("bookings.pnr"), nullable=False)

    passenger_type = Column(String(50), nullable=False)
    title = Column(String(20), nullable=True)
    first_name = Column(String(100), nullable=False)
    middle_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(String(20), nullable=True)
    nationality = Column(String(100), nullable=True)
    document_type = Column(String(100), nullable=True)
    document_number = Column(String(100), nullable=True)
    seat = Column(String(20), nullable=True)
    checked_in = Column(Boolean, default=False)
    unaccompanied_minor = Column(Boolean, default=False)

    booking = relationship("Booking", back_populates="passengers")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    booking_pnr = Column(String(20), ForeignKey("bookings.pnr"), nullable=False)

    title = Column(String(20), nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(150), nullable=False)
    address = Column(String(255), nullable=True)
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)

    booking = relationship("Booking", back_populates="contact")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_pnr = Column(String(20), ForeignKey("bookings.pnr"), nullable=False)
    method = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    amount = Column(Integer, nullable=False)
    transaction_reference = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="payments")


class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    intent = Column(String(100), nullable=True)
    response = Column(Text, nullable=False)
    outcome = Column(String(100), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    notification_type = Column(String(100), nullable=False)
    recipient = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), nullable=False)
    channel = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    role = Column(String(50), nullable=False)
    password_hash = Column(String(255), nullable=False)
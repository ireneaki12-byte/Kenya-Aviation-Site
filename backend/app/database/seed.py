from app.database.connection import SessionLocal, Base, engine
from app.database.models import (
    AddOn,
    AdminUser,
    Airport,
    Booking,
    ChatLog,
    Contact,
    FarePackage,
    Flight,
    NotificationLog,
    Passenger,
    Payment,
    Route,
    Seat,
)


def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def seed_airports(db):
    airports = [
        Airport(code="NBO", city="Nairobi", name="Jomo Kenyatta International Airport", country="Kenya", terminal="Terminal 1D"),
        Airport(code="MBA", city="Mombasa", name="Moi International Airport", country="Kenya", terminal="Terminal 1"),
        Airport(code="KIS", city="Kisumu", name="Kisumu International Airport", country="Kenya", terminal="Main Terminal"),
        Airport(code="EDL", city="Eldoret", name="Eldoret International Airport", country="Kenya", terminal="Main Terminal"),
        Airport(code="ZNZ", city="Zanzibar", name="Abeid Amani Karume International Airport", country="Tanzania", terminal="Terminal 3"),
        Airport(code="DOH", city="Doha", name="Hamad International Airport", country="Qatar", terminal="Main Terminal"),
    ]
    db.add_all(airports)


def seed_routes(db):
    routes = [
        Route(id="R-NBO-MBA", origin="NBO", destination="MBA", active=True),
        Route(id="R-MBA-NBO", origin="MBA", destination="NBO", active=True),
        Route(id="R-NBO-KIS", origin="NBO", destination="KIS", active=True),
        Route(id="R-KIS-NBO", origin="KIS", destination="NBO", active=True),
        Route(id="R-NBO-EDL", origin="NBO", destination="EDL", active=True),
        Route(id="R-EDL-NBO", origin="EDL", destination="NBO", active=True),
        Route(id="R-NBO-ZNZ", origin="NBO", destination="ZNZ", active=True),
        Route(id="R-ZNZ-NBO", origin="ZNZ", destination="NBO", active=True),
        Route(id="R-NBO-DOH", origin="NBO", destination="DOH", active=True),
        Route(id="R-DOH-NBO", origin="DOH", destination="NBO", active=True),
    ]
    db.add_all(routes)


def seed_flights(db):
    flights = [
        Flight(id="FL-101", flight_number="KAS 101", origin="NBO", destination="MBA", departure_time="08:30", arrival_time="09:35", duration="1h 05m", aircraft="KEV Embraer 190", terminal="Terminal 1D", gate="D4", seats_available=8, basic_fare=7800, plus_fare=11800),
        Flight(id="FL-102", flight_number="KAS 205", origin="NBO", destination="MBA", departure_time="14:10", arrival_time="15:15", duration="1h 05m", aircraft="KEV Embraer 190", terminal="Terminal 1D", gate="D7", seats_available=4, basic_fare=8500, plus_fare=12500),
        Flight(id="FL-103", flight_number="KAS 309", origin="NBO", destination="MBA", departure_time="19:20", arrival_time="20:25", duration="1h 05m", aircraft="KEV Embraer 190", terminal="Terminal 1D", gate="D2", seats_available=11, basic_fare=9200, plus_fare=13200),
        Flight(id="FL-201", flight_number="KAS 222", origin="NBO", destination="KIS", departure_time="07:45", arrival_time="08:40", duration="55m", aircraft="KEV Dash 8", terminal="Terminal 1D", gate="D3", seats_available=6, basic_fare=6800, plus_fare=9800),
        Flight(id="FL-202", flight_number="KAS 224", origin="KIS", destination="NBO", departure_time="18:10", arrival_time="19:05", duration="55m", aircraft="KEV Dash 8", terminal="Main Terminal", gate="B2", seats_available=9, basic_fare=7000, plus_fare=10000),
        Flight(id="FL-301", flight_number="KAS 710", origin="NBO", destination="DOH", departure_time="23:50", arrival_time="05:40", duration="5h 50m", aircraft="KEV Airbus A320", terminal="Terminal 1A", gate="A8", seats_available=12, basic_fare=49500, plus_fare=64500),
        Flight(id="FL-302", flight_number="KAS 711", origin="DOH", destination="NBO", departure_time="02:20", arrival_time="07:55", duration="5h 35m", aircraft="KEV Airbus A320", terminal="Main Terminal", gate="C6", seats_available=10, basic_fare=48700, plus_fare=63500),
        Flight(id="FL-401", flight_number="KAS 410", origin="NBO", destination="EDL", departure_time="06:50", arrival_time="07:45", duration="55m", aircraft="KEV Dash 8", terminal="Terminal 1D", gate="D6", seats_available=7, basic_fare=7200, plus_fare=10200),
        Flight(id="FL-402", flight_number="KAS 411", origin="EDL", destination="NBO", departure_time="17:25", arrival_time="18:20", duration="55m", aircraft="KEV Dash 8", terminal="Main Terminal", gate="A1", seats_available=5, basic_fare=7300, plus_fare=10300),
        Flight(id="FL-501", flight_number="KAS 540", origin="NBO", destination="ZNZ", departure_time="10:20", arrival_time="12:10", duration="1h 50m", aircraft="KEV Embraer 190", terminal="Terminal 1A", gate="A4", seats_available=13, basic_fare=24500, plus_fare=33500),
        Flight(id="FL-502", flight_number="KAS 541", origin="ZNZ", destination="NBO", departure_time="16:45", arrival_time="18:35", duration="1h 50m", aircraft="KEV Embraer 190", terminal="Terminal 3", gate="C2", seats_available=10, basic_fare=24800, plus_fare=33800),
    ]
    db.add_all(flights)


def seed_fare_packages(db):
    fares = [
        FarePackage(
            id="basic",
            name="Basic",
            description="A simple fare for customers travelling light.",
            included_cabin_baggage_kg=10,
            included_hold_baggage_kg=0,
            free_standard_seat=False,
            first_change_fee_waived=False,
        ),
        FarePackage(
            id="fare-plus",
            name="Fare Plus+",
            description="A more flexible fare with baggage and seat benefits.",
            included_cabin_baggage_kg=10,
            included_hold_baggage_kg=23,
            free_standard_seat=True,
            first_change_fee_waived=True,
        ),
    ]
    db.add_all(fares)


def seed_seats(db):
    unavailable = {"1A", "1B", "2C", "3D", "5A", "7F", "8C"}
    flights = db.query(Flight).all()

    seats = []
    for flight in flights:
        for row in range(1, 13):
            for letter in ["A", "B", "C", "D"]:
                seat_number = f"{row}{letter}"
                seats.append(
                    Seat(
                        flight_id=flight.id,
                        seat_number=seat_number,
                        seat_type="front" if row <= 2 else "standard",
                        status="unavailable" if seat_number in unavailable else "available",
                        price=1200 if row <= 2 else 750,
                    )
                )
    db.add_all(seats)


def seed_addons(db):
    addons = [
        AddOn(id="BAG-23", category="extra_baggage", name="23kg 1 item", price=2500, chargeable=True),
        AddOn(id="BAG-32", category="extra_baggage", name="32kg 1 item", price=3500, chargeable=True),
        AddOn(id="BAG-46", category="extra_baggage", name="46kg 2 pieces of 23kg", price=4800, chargeable=True),
        AddOn(id="BAG-64", category="extra_baggage", name="64kg 2 pieces of 32kg", price=6500, chargeable=True),

        AddOn(id="SPB-GOLF", category="special_baggage", name="Golf bag", price=3000, chargeable=True),
        AddOn(id="SPB-BIKE", category="special_baggage", name="Bike", price=4500, chargeable=True),
        AddOn(id="SPB-SURF", category="special_baggage", name="Surfboard", price=4200, chargeable=True),
        AddOn(id="SPB-DIVE", category="special_baggage", name="Dive equipment", price=4000, chargeable=True),

        AddOn(id="SSR-WCHR", category="special_assistance", name="Mobility assistance", price=0, chargeable=False),
        AddOn(id="SSR-BLND", category="special_assistance", name="Visual impairment assistance", price=0, chargeable=False),
        AddOn(id="SSR-DEAF", category="special_assistance", name="Hearing impairment assistance", price=0, chargeable=False),
        AddOn(id="SSR-HIDD", category="special_assistance", name="Hidden disability support", price=0, chargeable=False),
        AddOn(id="SSR-UNMR", category="special_assistance", name="Unaccompanied minor handling", price=0, chargeable=False),

        AddOn(id="MEAL-BFAST", category="meal", name="Tropical breakfast", price=900, chargeable=True),
        AddOn(id="MEAL-VEG", category="meal", name="Vegetarian meal", price=850, chargeable=True),
        AddOn(id="MEAL-CHILD", category="meal", name="Child meal", price=750, chargeable=True),
        AddOn(id="MEAL-PREM", category="meal", name="Premium coastal platter", price=1500, chargeable=True),
    ]
    db.add_all(addons)


def seed_sample_bookings(db):
    booking = Booking(
        pnr="KAS7K9P",
        status="Confirmed",
        payment_status="Succeeded",
        payment_reference="PAY-KAS7K9P",
        total=14250,
        flight_id="FL-101",
        fare_type="fare-plus",
    )
    db.add(booking)
    db.flush()

    passenger = Passenger(
        booking_pnr="KAS7K9P",
        passenger_type="adult",
        title="Ms",
        first_name="Demo",
        last_name="Passenger",
        nationality="Kenyan",
        document_type="National ID",
        document_number="12345678",
        seat="4A",
        checked_in=False,
    )

    contact = Contact(
        booking_pnr="KAS7K9P",
        title="Ms",
        first_name="Demo",
        last_name="Passenger",
        phone="0712345678",
        email="demo.passenger@example.com",
        address="Nairobi",
        country="Kenya",
        city="Nairobi",
    )

    payment = Payment(
        booking_pnr="KAS7K9P",
        method="card",
        status="Succeeded",
        amount=14250,
        transaction_reference="PAY-KAS7K9P",
    )

    db.add_all([passenger, contact, payment])


def seed_chat_logs(db):
    logs = [
        ChatLog(
            session_id="CHAT-001",
            message="I want to fly from Nairobi to Mombasa tomorrow morning",
            intent="search_flight",
            response="I found available flights from Nairobi to Mombasa.",
            outcome="flights_shown",
        ),
        ChatLog(
            session_id="CHAT-002",
            message="What baggage is included?",
            intent="faq_baggage",
            response="Basic fare includes 10kg cabin baggage. Fare Plus+ includes 23kg hold baggage.",
            outcome="answered",
        ),
        ChatLog(
            session_id="CHAT-003",
            message="Can you get me a private jet?",
            intent="fallback",
            response="I am unable to complete that request. Please use manual search or contact support.",
            outcome="fallback",
        ),
    ]
    db.add_all(logs)


def seed_notifications(db):
    notifications = [
        NotificationLog(
            notification_type="booking_confirmation",
            recipient="demo.passenger@example.com",
            message="Your Kenya Aviation booking KAS7K9P is confirmed.",
            status="Sent",
            channel="Email",
        ),
        NotificationLog(
            notification_type="checkin_reminder",
            recipient="demo.passenger@example.com",
            message="Online check-in is open for your Kenya Aviation flight.",
            status="Pending",
            channel="Email",
        ),
    ]
    db.add_all(notifications)


def seed_admin_users(db):
    admin = AdminUser(
        id="ADM-001",
        name="Kenya Aviation Admin",
        email="admin@kenyaaviation.example",
        role="admin",
        password_hash="replace-with-real-hash-in-production",
    )
    db.add(admin)


def seed_database():
    reset_database()

    db = SessionLocal()
    try:
        seed_airports(db)
        seed_routes(db)
        seed_flights(db)
        seed_fare_packages(db)
        db.commit()

        seed_seats(db)
        seed_addons(db)
        seed_sample_bookings(db)
        seed_chat_logs(db)
        seed_notifications(db)
        seed_admin_users(db)
        db.commit()

        print("PostgreSQL seed data inserted successfully.")
    except Exception as error:
        db.rollback()
        print(f"Seeding failed: {error}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
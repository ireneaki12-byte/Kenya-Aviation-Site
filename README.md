# Kenya Aviation Site

Kenya Aviation Site is a capstone proof of concept for an airline booking website with AI chat booking assistance.

## Features

- Responsive airline-style website
- One-way and return flight search
- Passenger rules validation
- Basic and Fare Plus+ fare packages
- Passenger and contact details
- Seat, baggage, assistance and meal add-ons
- Booking summary confirmation before payment
- Mock card and M-Pesa payment simulation
- Booking reference generation and itinerary sending
- Online check-in and boarding pass screen with downloadable boarding pass
- Agentic AI chatbot
- Admin dashboard, chatbot logs and analytics

## Tech Stack

Frontend:
- React
- Vite
- Playwright

Backend:
- FastAPI
- PostgreSQL
- SQLAlchemy
- Pytest

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

## Run backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Run tests

```bash
cd backend
pytest
python -m pytest -v
```

```bash
cd frontend
npx playwright test
```

de## Architecture

See `docs/architecture.md`.

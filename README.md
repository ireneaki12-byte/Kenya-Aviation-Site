# Kenya Aviation Site

Kenya Aviation is a full-stack flight booking web application built as a Quantic Master of Software and Systems Engineering (MSSE) Capstone project. It enables customers to search for flights, book one-way and return journeys, select seats and add-ons, pay online, check in, and receive an itinerary by email. An AI-powered chatbot assists customers throughout their journey, and a secure admin dashboard provides operational visibility.
The system is designed as a production-quality proof-of-concept that demonstrates a clean layered architecture, modern software engineering patterns, AI integration, and a responsive multi-device user experience.

The system is designed using clean layered architecture, modern software engineering patterns, AI integration and a responsive multi-device user experience.

## Problem Statement
Kenya Aviation Site addresses the need for a modern, self-service airline booking platform that allows customers to search flights, select fares, enter passenger details, choose add-ons, complete bookings, check in and receive travel assistance through an AI-powered voice/chatbot.

## GitHub Link
https://github.com/ireneaki12-byte/Kenya-Aviation-Site.git


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

## Technology Stack

Frontend:
- React- React was chosen for its reusable component model and state-driven UI.
- Vite- Vite was chosen for fast development, efficient builds, and straightforward deployment of the frontend as a static site.

Backend:
- FastAPI -This was selected because it is fast and it automatically generates Swagger documentation enabling interactive API testing at /docs without additional tooling.
- PostgreSQL -This was selected because it is ACID compliant, it supports rich data types and is scalable.
- SQLAlchemy - SQLAlchemy ORM decouples business logic from raw SQL,it also enables the Repository pattern making it straightforward to swap the underlying database engine in future.

Tests:
- Playwright was used to test the application’s end-to-end user experience, 
- Vitest was used for frontend unit/component tests 
- Pytest was used for backend business logic tests. 
Use of the above 3 tools created layered test coverage across the system: backend rules, frontend components and full customer journeys.

AI Layer:
-The Anthropic Claude API (claude-sonnet-4.6 model) powers the agentic travel assistant chatbot.

Authentication:
-PyJWT is used to implement token-based authentication for protected backend services, particularly the admin dashboard and administrative API routes.

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

## Website URL: 
https://kenya-aviation.onrender.com


## Architectural Decisions

The application is structured as a layered monolith rather than microservices with the following layers: API(HTTP handlers), Application services (Orchestrates domain logic and infrastructure calls), Domain (business logic and knowledge base), Infrastructure (Database access with repository pattern) and Database layers (persistant state data).

A monolith was chosen over microservices because: 
(a) the team is a single developer- there was a resourcing constraint that would make managing microservices complex and cumbersome for a single developer.
(b) microservices introduce distributed systems complexity (network partitions, eventual consistency, service discovery) making deployment and maintenance an onerous task.

Patterns Used:
- Repository Pattern - This acts as the protective shield and structural bridge between your PostgreSQL database, the State Machine and the Server-Authoritative Pricing engine. It protects the integrity of the state machine, secures server authoritative pricing and prevents database sprawl making it easier to maintain.
- State Machine - Since the booking process is multistate, this pattern would ensure booking can only be in one official status at a time and it can only move to a new status by following exact and pre-approved paths.
- Server Authoritative Control - The server authoritative pattern was adopted to ensure that business-critical calculations and validations are performed by the backend rather than the client to avoid manipulation. This way, there is a single source of truth. This improves security, consistency, auditability and reliability for a multi-user booking platform.
- Factory Pattern - This was used to create unique booking references without exposing the DB internals.


Artificial Intelligence:
The chatbot is implemented as a tool-use agent rather than a simple rule-based keyword matcher. 
AI has been used to conduct 2 functions:
(a) Booking -Revenue Generation
(b) Respond to Queries - Customer Service
Agentic AI has been used. Claude decides which tool to call and when, based on the conversation, without any hardcoded if/elif logic in the backend. The pattern used here is the agentic loop pattern.

Retrieval Augmented Generation
A knowledge repository was used to ground the model so that the responses provided are aligned with the airline's policies.

## Software Testing
The testing followed a layered approach aligned with the application's architecture. Tests were written at the unit level for pure domain logic and integration-style checks cover the full booking flow. All automated tests were run in CI on every push to the main branch via GitHub Actions.

- Backend unit tests which tested the Domain logic, pricing, state machine, booking rules were done using pytest.
- Backend linting used to review Python code style, unused imports and type errors was done using Ruff.
- Frontend unit/component tests covering components and service functions were run using vitest.
- Front end build check was done using vite build to confirm the production bundle compiles without error.
- End to End tests were done using Playwright
- CodeQL was used for SAST security analysis to ensure there were no Python and JavaScript injection and insecure patterns
- Backend and Front End Dependency Audits were done to ensure third-party dependencies used are not an attack vector.
- The chatbot, end to end tests and browser responsiveness tests were done manually.

## Sprints
The project was carried out in 4 sprints as follows:

Sprint 1: Foundation & Architecture (10 Mar – 29 Mar 2026)
Sprint 2: Booking Flow Development (30 Mar – 19 Apr 2026)
Sprint 3: Add-ons, AI Assistant & Admin (20 Apr – 10 May 2026)
Sprint 4: Testing, Deployment & Documentation (11 May – 31 May 2026)

## Trello
These were captured on Trello on this board: https://trello.com/invite/b/6a146f238ffc5307e80c2e66/ATTI29f40ddfd1a47fb796e0c7818281c2e8B8C1A733/kavsite

## Project Structure

The project is organised as a full-stack aviation booking platform with a FastAPI backend, React/Vite frontend, automated CI workflow, backend unit tests, frontend component tests and Playwright end-to-end tests.

```text
Kenya Aviation Site/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── README.md
├── docs/
│   ├── architecture.md
│   ├── deployment.md
│   ├── requirements.md
│   └── testing.md
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── dependencies.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── addons.py
│   │   │       ├── admin.py
│   │   │       ├── admin_auth.py
│   │   │       ├── bookings.py
│   │   │       ├── chat.py
│   │   │       ├── checkin.py
│   │   │       ├── email.py
│   │   │       ├── flights.py
│   │   │       ├── passengers.py
│   │   │       └── payments.py
│   │   ├── application/
│   │   │   ├── __init__.py
│   │   │   └── services/
│   │   │       ├── __init__.py
│   │   │       ├── ai_conversation_service.py
│   │   │       ├── booking_service.py
│   │   │       ├── payment_service.py
│   │   │       └── pricing_service.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── connection.py
│   │   │   ├── init_db.py
│   │   │   ├── models.py
│   │   │   └── seed.py
│   │   ├── domain/
│   │   │   ├── __init__.py
│   │   │   ├── knowledge_base.py
│   │   │   ├── booking/
│   │   │   │   ├── booking_state.py
│   │   │   │   └── pricing.py
│   │   │   ├── models/
│   │   │   │   ├── __init__.py
│   │   │   │   └── schemas.py
│   │   │   └── rules/
│   │   │       ├── __init__.py
│   │   │       └── passenger_rules.py
│   │   ├── infrastructure/
│   │   │   ├── __init__.py
│   │   │   ├── adapters/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── mock_notification_adapter.py
│   │   │   │   └── mock_payment_adapter.py
│   │   │   └── repositories/
│   │   │       ├── __init__.py
│   │   │       └── postgres_repository.py
│   │   └── templates/
│   │       └── itinerary-email.html
│   ├── tests/
│   │   └── unit/
│   │       ├── test_booking_state.py
│   │       ├── test_passenger_rules.py
│   │       └── test_pricing.py
│   ├── package.json
│   ├── package-lock.json
│   ├── pytest-results.txt
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── playwright.config.js
    ├── vitest.config.js
    ├── public/
    │   └── images/
    │       ├── kev-aircraft.jpg
    │       ├── kev-boarding.jpg
    │       ├── kev-city.jpg
    │       ├── kev-eldoret.jpg
    │       ├── kev-flying.jpg
    │       ├── kev-kilimanjaro.jpg
    │       ├── kev-lamu.jpg
    │       ├── kev-logo.jpg
    │       ├── kev-maasai-mara.jpg
    │       ├── kev-mahali.jpg
    │       ├── kev-meals.jpg
    │       ├── kev-mountain.jpg
    │       └── kev-seats.jpg
    ├── e2e/
    │   ├── addons.spec.js
    │   ├── admin.spec.js
    │   ├── booking-flow.spec.js
    │   ├── chatbot.spec.js
    │   ├── checkin.spec.js
    │   ├── flight-search.spec.js
    │   ├── home.spec.js
    │   └── passenger-details.spec.js
    ├── src/
    │   ├── main.jsx
    │   ├── styles/
    │   │   └── global.css
    │   ├── components/
    │   │   ├── admin/
    │   │   │   ├── DataTable.jsx
    │   │   │   └── MetricCard.jsx
    │   │   ├── booking/
    │   │   │   ├── BookingSummaryCard.jsx
    │   │   │   ├── FareSelector.jsx
    │   │   │   ├── FlightCard.jsx
    │   │   │   ├── PassengerSelector.jsx
    │   │   │   └── SeatMap.jsx
    │   │   ├── chatbot/
    │   │   │   └── ChatbotWidget.jsx
    │   │   └── common/
    │   │       ├── AppShell.jsx
    │   │       ├── Boardingpass.jsx
    │   │       ├── Button.jsx
    │   │       ├── DestinationGallery.jsx
    │   │       ├── Field.jsx
    │   │       ├── ImageCarousel.jsx
    │   │       ├── PageBanner.jsx
    │   │       ├── PageBannerCommon.jsx
    │   │       ├── PageTitle.jsx
    │   │       └── ProgressSteps.jsx
    │   ├── hooks/
    │   │   ├── useMoney.js
    │   │   └── useVoiceInput.js
    │   ├── pages/
    │   │   ├── AddOns.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── BookingSummary.jsx
    │   │   ├── CheckIn.jsx
    │   │   ├── Confirmation.jsx
    │   │   ├── FlightResults.jsx
    │   │   ├── FlightSearch.jsx
    │   │   ├── Home.jsx
    │   │   ├── PassengerDetails.jsx
    │   │   └── Payment.jsx
    │   └── services/
    │       ├── apiClient.js
    │       ├── emailService.js
    │       ├── pricingService.js
    │       └── __tests__/
    │           └── pricingService.test.js
    └── tests/
        ├── addons-normalisation.test.js
        ├── button.test.jsx
        ├── money-format.test.js
        ├── page-title.test.jsx
        ├── passenger-rules.test.js
        ├── pricing-summary.test.js
        ├── progress-steps.test.jsx
        └── setup.js
```

Deployment Options
(a) On Cloud The solution could be deployed on cloud (AWS/Azure/GCP)

React frontend (static) -	AWS S3 + Azure CloudFront/Static Web Apps/	GCP Cloud Storage + CDN @$1-$5
- FastAPI backend         - AWS Elastic Beanstalk or ECS Fargate/ Azure App Service/ GCP	Cloud Run @$20 -$50
- PostgreSQL              - AWS RDS PostgreSQL/	Azure Database for PostgreSQL/ GCP	Cloud SQL @$15-$25
- Email delivery          - AWS SES (replace SMTP)/ Azure	Communication Services/ GCP	Gmail / SendGrid @ approx $1
- Secrets (API keys)      - AWS Secrets Manager/ Azure Key Vault/ GCPSecret Manager
- Anthropic AI @$3-$15

The above combined could cost upto approx. $105 per month

(b) On Premise Deployment 

- This was not feasible as a private project due to the high capital costs associated with setting up an on prem data centre.

(c) Serverless/PaaS 
This option has been selected as it is the fastest to set up and has vsery low implementation costs and its quick to set up.

- Frontend: Render — automatic deploys from GitHub, global CDN, custom domain @ $0.04
- Backend: Render — deploy the FastAPI container from GitHub @$0.03
- Database: Render Cost: $0.4
- Anthropic AI @$23.20

Total cost for a pilot: $23.27/month which is cost efficient and sufficient for demonstration purposes.

**Disclaimer**- AI was used for research of various tools to use and why, to generate code and for troubleshooting throughout the development.
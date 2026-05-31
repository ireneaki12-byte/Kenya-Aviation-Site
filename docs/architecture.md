# Kenya Aviation Site Architecture

The system uses a modular monolith with clean architecture principles. The frontend is a responsive React application. The backend is a FastAPI REST API separated into API routes, application services, domain rules, repositories, adapters and seed data.

Key patterns:
- Clean architecture / layered architecture
- Repository pattern
- Service layer pattern
- State machine for booking lifecycle
- Strategy-style mock payment handling
- Specification/rules pattern for passenger validation
- Adapter pattern for mock inventory, payment and notifications
- Controlled AI workflow using backend tools and a FAQ knowledge base

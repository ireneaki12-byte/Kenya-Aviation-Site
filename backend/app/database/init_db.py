from app.database.connection import Base, engine
import app.database.models  # noqa: F401


def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite DB
DATABASE_URL = "sqlite:///./stocks.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# 🔥 THIS IS MISSING (IMPORTANT)
Base = declarative_base()
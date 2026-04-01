from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database import Base


class StockHistory(Base):
    __tablename__ = "stock_history"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    close = Column(Float)
    volatility = Column(Float)
    trend = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


# (Optional future-ready model — you can keep or remove)
class StockSummary(Base):
    __tablename__ = "stock_summary"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    avg_close = Column(Float)
    high_52w = Column(Float)
    low_52w = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
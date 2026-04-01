from fastapi import FastAPI
import pandas as pd
import yfinance as yf
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, SessionLocal
from app.models import Base, StockHistory   
# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

#  CORS (for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Helper function
# -------------------------------
def get_processed_data(symbol):
    stock = yf.Ticker(f"{symbol}.NS")
    df = stock.history(period="1y")

    df.reset_index(inplace=True)
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values(by='Date')
    df = df.ffill()

    # Metrics
    df['Daily_Return'] = (df['Close'] - df['Open']) / df['Open']
    df['MA_7'] = df['Close'].rolling(window=7).mean()
    df['Volatility'] = df['Daily_Return'].rolling(window=7).std() * 100

    return df

# -------------------------------
# Routes
# -------------------------------
@app.get("/")
def home():
    return {"message": "StockMind API running 🚀"}


@app.get("/companies")
def get_companies():
    return ["INFY", "TCS", "RELIANCE"]


@app.get("/data/{symbol}")
def get_stock_data(symbol: str):
    df = get_processed_data(symbol)
    return df.tail(30).to_dict(orient="records")


@app.get("/summary/{symbol}")
def get_summary(symbol: str):
    df = get_processed_data(symbol)

    return {
        "52W High": float(df["Close"].max()),
        "52W Low": float(df["Close"].min()),
        "Average Close": float(df["Close"].mean())
    }

# -------------------------------
# INSIGHTS (UPDATED WITH DB)
# -------------------------------
@app.get("/insights/{symbol}")
def get_insights(symbol: str):
    df = get_processed_data(symbol)

    latest = df.iloc[-1]
    avg_close = df["Close"].mean()
    volatility = latest["Volatility"]

    # Trend
    if latest["Close"] > avg_close:
        trend = "Uptrend 📈"
    else:
        trend = "Downtrend 📉"

    # Risk
    if volatility < 2:
        risk = "Low Risk"
    elif volatility < 5:
        risk = "Medium Risk"
    else:
        risk = "High Risk"

    # Recommendation
    if trend == "Uptrend 📈" and risk == "Low Risk":
        recommendation = "Buy 🟢"
    elif risk == "High Risk":
        recommendation = "Sell 🔴"
    else:
        recommendation = "Hold 🟡"

    # SAVE TO DATABASE
    db = SessionLocal()

    stock_entry = StockHistory(
        symbol=symbol,
        close=float(latest["Close"]),
        volatility=float(volatility),
        trend=trend
    )

    db.add(stock_entry)
    db.commit()
    db.close()

    return {
        "Trend": trend,
        "Volatility": float(volatility),
        "Risk Level": risk,
        "Recommendation": recommendation
    }

# -------------------------------
# COMPARE
# -------------------------------
@app.get("/compare")
def compare_stocks(symbol1: str, symbol2: str):
    df1 = get_processed_data(symbol1)
    df2 = get_processed_data(symbol2)

    if df1 is None or df2 is None or len(df1) < 30 or len(df2) < 30:
        return {"error": "Not enough data to compare stocks"}

    ret1 = (df1["Close"].iloc[-1] - df1["Close"].iloc[-30]) / df1["Close"].iloc[-30]
    ret2 = (df2["Close"].iloc[-1] - df2["Close"].iloc[-30]) / df2["Close"].iloc[-30]

    vol1 = df1["Volatility"].mean()
    vol2 = df2["Volatility"].mean()

    winner = symbol1 if ret1 > ret2 else symbol2

    return {
        "Stock1": symbol1,
        "Stock1_Return_%": float(ret1 * 100),
        "Stock1_Volatility": float(vol1),

        "Stock2": symbol2,
        "Stock2_Return_%": float(ret2 * 100),
        "Stock2_Volatility": float(vol2),

        "Winner": winner
    }

# -------------------------------
#HISTORY API
# -------------------------------
@app.get("/history")
def get_history():
    db = SessionLocal()

    # Get latest records first
    records = db.query(StockHistory).order_by(StockHistory.id.desc()).all()

    # Remove duplicates (keep latest per stock)
    seen = set()
    unique = []

    for r in records:
        if r.symbol not in seen:
            seen.add(r.symbol)
            unique.append(r)

    return unique
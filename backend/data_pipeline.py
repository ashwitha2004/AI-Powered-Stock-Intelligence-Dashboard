import yfinance as yf
import pandas as pd


# 1. Fetch data (with error handling)
def fetch_stock_data(symbol="INFY.NS", period="1y"):
    try:
        stock = yf.Ticker(symbol)
        df = stock.history(period=period)

        if df is None or df.empty:
            raise ValueError("No data fetched. Check symbol or network.")

        df.reset_index(inplace=True)
        return df

    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return None


# 2. Clean data
def clean_data(df):
    df = df.copy()

    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values(by='Date')

    # Fix for new pandas versions
    df = df.ffill()

    return df


# 3. Add metrics
def add_metrics(df):
    df = df.copy()

    # Daily Return
    df['Daily_Return'] = (df['Close'] - df['Open']) / df['Open']

    # 7-day Moving Average
    df['MA_7'] = df['Close'].rolling(window=7).mean()

    # 52-week High & Low
    df['52W_High'] = df['Close'].rolling(window=252).max()
    df['52W_Low'] = df['Close'].rolling(window=252).min()

    return df


# 4. Custom metric (unique feature)
def add_custom_metrics(df):
    df = df.copy()

    # Volatility Score
    df['Volatility'] = df['Daily_Return'].rolling(window=7).std() * 100

    return df


# 5. Full pipeline
def process_stock(symbol="INFY.NS"):
    df = fetch_stock_data(symbol)

    if df is None:
        print("⚠️ Data fetch failed. Exiting...")
        return None

    df = clean_data(df)
    df = add_metrics(df)
    df = add_custom_metrics(df)

    return df


# 6. Run pipeline
if __name__ == "__main__":
    df = process_stock("INFY.NS")

    if df is not None:
        df.to_csv("infy_processed.csv", index=False)
        print("✅ Step 1 Complete — Data Processed & Saved!")
        print(df.tail())
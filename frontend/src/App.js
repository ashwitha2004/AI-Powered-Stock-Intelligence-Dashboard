import React, { useState, useEffect, useCallback } from "react";
import API from "./api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function App() {
  const [symbol, setSymbol] = useState("INFY");
  const [data, setData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [history, setHistory] = useState([]);

  // Fetch stock data
  const fetchData = useCallback(async (sym) => {
    try {
      const res = await API.get(`/data/${sym}`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, []);

  // Fetch insights
  const fetchInsights = useCallback(async (sym) => {
    try {
      const res = await API.get(`/insights/${sym}`);
      setInsights(res.data);
    } catch (err) {
      console.error("Error fetching insights:", err);
    }
  }, []);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const res = await API.get("/history");
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData(symbol);
    fetchInsights(symbol);
    fetchHistory();
  }, [symbol, fetchData, fetchInsights, fetchHistory]);

  // Chart config
  const chartData = {
    labels: data.map((d) => d.Date?.split("T")[0]),
    datasets: [
      {
        label: `${symbol} Price`,
        data: data.map((d) => d.Close),
        borderColor: "#2563eb",
        borderWidth: 2,
        tension: 0.3,
        fill: false,
      },
    ],
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "20%",
          background: "#0f172a",
          color: "white",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Stocks</h2>

        {["INFY", "TCS", "RELIANCE"].map((s) => (
          <div
            key={s}
            onClick={() => setSymbol(s)}
            style={{
              cursor: "pointer",
              margin: "12px 0",
              padding: "10px",
              borderRadius: "8px",
              background: symbol === s ? "#2563eb" : "transparent",
              transition: "0.3s",
            }}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div style={{ width: "60%", padding: "20px" }}>
        <h2 style={{ marginBottom: "20px" }}>{symbol} Price Chart</h2>
        <Line data={chartData} />
      </div>

      {/* Insights + History */}
      <div
        style={{
          width: "20%",
          background: "#f8fafc",
          padding: "20px",
          borderLeft: "1px solid #e2e8f0",
          overflowY: "auto",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Insights</h2>

        {insights ? (
          <>
            <p>
              <b>Trend:</b> {insights.Trend}
            </p>
            <p>
              <b>Risk:</b> {insights["Risk Level"]}
            </p>
            <p>
              <b>Volatility:</b>{" "}
              {insights.Volatility ? insights.Volatility.toFixed(2) : "N/A"}
            </p>
            <p>
              <b>Recommendation:</b> {insights.Recommendation}
            </p>
          </>
        ) : (
          <p>Loading...</p>
        )}

        {/* History Section */}
        <h3 style={{ marginTop: "30px" }}>History</h3>

        {history.length === 0 ? (
          <p>No history yet</p>
        ) : (
          history.map((item, index) => (
            <div
              key={index}
              style={{
                background: "#e2e8f0",
                padding: "10px",
                margin: "10px 0",
                borderRadius: "8px",
              }}
            >
              <b>{item.symbol}</b>
              <p>Close: {item.close.toFixed(2)}</p>
              <p>Volatility: {item.volatility.toFixed(2)}</p>
              <p>Trend: {item.trend}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;

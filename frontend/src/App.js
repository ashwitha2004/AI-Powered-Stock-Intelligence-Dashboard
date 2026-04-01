import React, { useState, useEffect } from "react";
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
  const [history, setHistory] = useState([]); // 🔥 NEW

  useEffect(() => {
    fetchData(symbol);
    fetchInsights(symbol);
  }, [symbol]);

  // Fetch stock data
  const fetchData = async (sym) => {
    try {
      const res = await API.get(`/data/${sym}`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  
  const fetchInsights = async (sym) => {
    try {
      const res = await API.get(`/insights/${sym}`);
      setInsights(res.data);

      // 🔥 IMPORTANT: fetch history AFTER saving happens
      fetchHistory();
    } catch (err) {
      console.error("Error fetching insights:", err);
    }
  };

  // 🔥 Fetch history
  const fetchHistory = async () => {
    try {
      const res = await API.get(`/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

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
      <div style={{ width: "55%", padding: "20px" }}>
        <h2 style={{ marginBottom: "20px" }}>{symbol} Price Chart</h2>
        <Line data={chartData} />
      </div>

      {/* Insights + History Panel */}
      <div
        style={{
          width: "25%",
          background: "#f8fafc",
          padding: "20px",
          borderLeft: "1px solid #e2e8f0",
          overflowY: "auto",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Insights</h2>

        {insights ? (
          <>
            <p><b>Trend:</b> {insights.Trend}</p>
            <p><b>Risk:</b> {insights["Risk Level"]}</p>
            <p><b>Volatility:</b> {insights.Volatility.toFixed(2)}</p>
            <p><b>Recommendation:</b> {insights.Recommendation}</p>
          </>
        ) : (
          <p>Loading...</p>
        )}

        {/* 🔥 HISTORY SECTION */}
        <h3 style={{ marginTop: "30px" }}>History</h3>

        {history.length > 0 ? (
          history.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: "15px",
                padding: "10px",
                borderRadius: "8px",
                background: "#e2e8f0",
              }}
            >
              <strong>{item.symbol}</strong>
              <br />
              Close: {item.close.toFixed(2)}
              <br />
              Volatility: {item.volatility.toFixed(2)}
              <br />
              Trend: {item.trend}
            </div>
          ))
        ) : (
          <p>No history yet</p>
        )}
      </div>
    </div>
  );
}

export default App;
import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-powered-stock-intelligence-dashboard.onrender.com",
});

export default API;

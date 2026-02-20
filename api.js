// src/api.js
import axios from "axios";

// ✅ Your correct Render backend URL
const backendUrl = "https://kitalumni-backend.onrender.com";

const api = axios.create({
  baseURL: `${backendUrl}/api`, // All API routes prefixed with /api
  withCredentials: true, // Allow cookies/auth headers
});

export default api;

// src/socket.js
import { io } from "socket.io-client";

// ✅ Your Render backend URL
const backendUrl = "https://pradeepkumar.site";

export const socket = io(backendUrl, {
  transports: ["websocket", "polling"], // fallback to polling to avoid handshake 503 errors
  withCredentials: true,
});

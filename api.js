import axios from "axios";

const api = axios.create({
  baseURL: "https://kitalumni-backend.onrender.com/api",
});

// 🔥 FORCE TOKEN ATTACH
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("🚀 TOKEN ATTACHED:", token); // DEBUG

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
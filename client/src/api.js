import axios from "axios";

const backendUrl = "https://kitalumni-backend.onrender.com";

const api = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
});

export default api;
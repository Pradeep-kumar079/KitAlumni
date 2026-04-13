import axios from "axios";

const backendUrl = "https://pradeepkumar.site";

const api = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
});

export default api;
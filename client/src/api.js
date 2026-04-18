import API from "api";

const api = API.create({
  baseURL: "/api",
  withCredentials: true,
});

export default api;
import API from "../api";

const api = API.create({
  baseURL: "https://pradeepkumar.site/api",
});

// 🔥 FORCE TOKEN ATTACH
api.interceptors.request.use((config) => {  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization; // 🔥 VERY IMPORTANT
  }

  return config;
});

export default api;
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthPage = ["/login", "/register"].includes(window.location.pathname);
    if (error.response?.status === 401 && !isAuthPage) {
      [
        "token",
        "demoRole",
        "demoBackendRole",
        "demoEmail",
        "demoPhone",
        "demoName",
        "demoCreatedAt",
      ].forEach((key) => localStorage.removeItem(key));
      window.location.assign("/login");
    }

    return Promise.reject(error);
  }
);

export default apiClient;

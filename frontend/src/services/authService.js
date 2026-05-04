import apiClient from "./apiClient";

export const login = (email, password) =>
  apiClient.post("/api/auth/login", { email, password });

export const register = (name, email, password) =>
  apiClient.post("/api/auth/register", { name, email, password });

export const getMe = () =>
  apiClient.get("/api/auth/me");

export const getAdminUsers = () =>
  apiClient.get("/api/admin/users");

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("demoRole");
  localStorage.removeItem("demoBackendRole");
  localStorage.removeItem("demoEmail");
  localStorage.removeItem("demoName");
  localStorage.removeItem("demoCreatedAt");
};

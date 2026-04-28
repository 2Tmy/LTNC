import apiClient from "./apiClient";

export const login = (email, password) =>
  apiClient.post("/api/auth/login", { email, password });

export const register = (name, email, password) =>
  apiClient.post("/api/auth/register", { name, email, password });

export const getMe = () =>
  apiClient.get("/api/auth/me");

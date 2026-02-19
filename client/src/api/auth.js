import { apiClient, setToken } from "./client.js";
export async function login(username, password) {
  const data = await apiClient("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
  setToken(data.token);
  return data;
}
export async function getMe() {
  return apiClient("/api/auth/me");
}
export function logout() {
  setToken(null);
}

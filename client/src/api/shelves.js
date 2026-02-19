import { apiClient } from "./client.js";
export async function getShelves() {
  return apiClient("/api/shelves");
}
export async function createShelf(name) {
  return apiClient("/api/shelves", { method: "POST", body: JSON.stringify({ name }) });
}
export async function updateShelf(id, name) {
  return apiClient(`/api/shelves/${id}`, { method: "PUT", body: JSON.stringify({ name }) });
}
export async function deleteShelf(id) {
  return apiClient(`/api/shelves/${id}`, { method: "DELETE" });
}

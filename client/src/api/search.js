import { apiClient } from "./client.js";
export async function searchBooks(params) {
  const q = typeof params === "string" ? params : params.q;
  const page = typeof params === "object" ? params.page || 1 : 1;
  const limit = typeof params === "object" ? params.limit || 20 : 20;
  return apiClient(`/api/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);
}
export async function getWorkDetails(olWorkKey) {
  return apiClient(`/api/search/work/${olWorkKey.replace("/works/", "")}`);
}
export async function getEditionDetails(olEditionKey) {
  return apiClient(`/api/search/edition/${olEditionKey.replace("/books/", "")}`);
}

import { apiClient } from "./client.js";

export async function lookupISBN(isbn) {
  return apiClient(`/api/search/isbn/${encodeURIComponent(isbn)}`);
}

import { apiClient } from "./client.js";
export async function getBooks(params = {}) {
  const q = new URLSearchParams();
  if (params.shelf) q.set("shelf", params.shelf);
  if (params.sort) q.set("sort", params.sort);
  if (params.order) q.set("order", params.order);
  if (params.page) q.set("page", params.page);
  if (params.limit) q.set("limit", params.limit);
  if (params.reader) q.set("reader", params.reader);
  return apiClient(`/api/books?${q.toString()}`);
}
export async function getBook(id) {
  return apiClient(`/api/books/${id}`);
}
export async function addBook(data) {
  return apiClient("/api/books", { method: "POST", body: JSON.stringify(data) });
}
export async function updateBook(id, u) {
  return apiClient(`/api/books/${id}`, { method: "PUT", body: JSON.stringify(u) });
}
export async function deleteBook(id) {
  return apiClient(`/api/books/${id}`, { method: "DELETE" });
}
export async function moveToShelf(bookId, shelfId) {
  return apiClient(`/api/books/${bookId}/shelf`, { method: "PUT", body: JSON.stringify({ shelfId }) });
}
export const moveBookToShelf = moveToShelf;
export async function updateProgress(bookId, currentPage) {
  return apiClient(`/api/books/${bookId}/progress`, { method: "PUT", body: JSON.stringify({ currentPage }) });
}
export async function updateRating(bookId, rating) {
  return apiClient(`/api/books/${bookId}/rating`, { method: "PUT", body: JSON.stringify({ rating }) });
}
export async function updateReview(bookId, review) {
  return apiClient(`/api/books/${bookId}/review`, { method: "PUT", body: JSON.stringify({ review }) });
}
export async function updateReader(bookId, reader) {
  return apiClient(`/api/books/${bookId}/reader`, { method: "PUT", body: JSON.stringify({ reader }) });
}
export async function getProgressHistory(bookId) {
  return apiClient(`/api/books/${bookId}/progress-history`);
}
export async function getOLWork(olWorkKey) {
  return apiClient(`/api/books/ol/${olWorkKey}`);
}
export async function getLibraryKeys() {
  const data = await apiClient("/api/books/library-keys");
  return data.keys || [];
}
export const getLibraryWorkKeys = getLibraryKeys;
export async function updateLocation(bookId, locationName, locationLat, locationLng) {
  return apiClient(`/api/books/${bookId}/location`, {
    method: "PUT",
    body: JSON.stringify({ locationName, locationLat, locationLng }),
  });
}
export async function removeLocation(bookId) {
  return apiClient(`/api/books/${bookId}/location`, { method: "DELETE" });
}

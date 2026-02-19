import { apiClient } from "./client.js";
export async function getAuthor(olAuthorKey) {
  return apiClient(`/api/authors/${olAuthorKey.replace("/authors/", "")}`);
}
export async function getAuthorWorks(olAuthorKey, page = 1, limit = 20) {
  return apiClient(`/api/authors/${olAuthorKey.replace("/authors/", "")}/works?page=${page}&limit=${limit}`);
}

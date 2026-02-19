import { apiClient } from "./client.js";
export async function getOverview(reader) {
  const q = reader ? `?reader=${reader}` : "";
  return apiClient(`/api/stats/overview${q}`);
}
export async function getByYear(year, reader) {
  const q = new URLSearchParams({ year });
  if (reader) q.set("reader", reader);
  return apiClient(`/api/stats/by-year?${q.toString()}`);
}
export async function getGenres(reader) {
  const q = reader ? `?reader=${reader}` : "";
  return apiClient(`/api/stats/genres${q}`);
}
export async function getRatings(reader) {
  const q = reader ? `?reader=${reader}` : "";
  return apiClient(`/api/stats/ratings${q}`);
}

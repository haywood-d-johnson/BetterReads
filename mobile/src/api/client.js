// Mobile port of client/src/api/client.js.
// Differences from the web version:
//  - Prefixes an absolute base URL (EXPO_PUBLIC_API_URL) since there is no
//    Vite dev proxy on a device.
//  - Reads the token asynchronously from secure storage.
//  - On 401, clears the token and notifies a registered handler (the auth
//    context) instead of doing window.location redirects.
import { getToken, clearToken } from "./storage.js";

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");

let onUnauthorized = null;
export function registerUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export function apiUrl(endpoint) {
  // Endpoints are passed as "/api/..." just like the web client.
  return `${BASE_URL}${endpoint}`;
}

export async function apiClient(endpoint, options = {}) {
  const token = await getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(apiUrl(endpoint), { ...options, headers });
  } catch (networkErr) {
    throw new Error(
      `Network request failed. Is the API reachable at ${BASE_URL}? (${networkErr.message})`,
    );
  }

  if (response.status === 401) {
    await clearToken();
    if (onUnauthorized) onUnauthorized();
    throw new Error("Unauthorized");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

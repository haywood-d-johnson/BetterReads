export function setToken(token) {
  if (token) localStorage.setItem("betterreads_token", token);
  else localStorage.removeItem("betterreads_token");
}

export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem("betterreads_token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(endpoint, { ...options, headers });
  if (response.status === 401) {
    setToken(null);
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

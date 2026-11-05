// Mobile port of client/src/context/AuthContext.jsx.
// Same provider shape { user, loading, login, logout }, but token reads are
// async (secure storage) and a 401 anywhere in the app flips us back to the
// logged-out state via registerUnauthorizedHandler.
import { createContext, useState, useEffect } from "react";
import { getMe, logout as apiLogout, login as apiLogin } from "../api/auth.js";
import { getToken } from "../api/storage.js";
import { registerUnauthorizedHandler } from "../api/client.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Any 401 from apiClient clears the session.
    registerUnauthorizedHandler(() => setUser(null));

    let active = true;
    (async () => {
      const token = await getToken();
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        const data = await getMe();
        if (active) setUser(data.user);
      } catch {
        await apiLogout();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function login(username, password) {
    const data = await apiLogin(username, password);
    setUser(data.user);
    return data;
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

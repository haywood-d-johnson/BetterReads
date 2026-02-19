import { createContext, useState, useEffect } from "react";
import { getMe, logout as apiLogout, login as apiLogin } from "../api/auth.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("betterreads_token");
    if (token) {
      getMe()
        .then((data) => setUser(data.user))
        .catch(() => {
          apiLogout();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(username, password) {
    const data = await apiLogin(username, password);
    setUser(data.user);
    return data;
  }
  function logout() {
    apiLogout();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

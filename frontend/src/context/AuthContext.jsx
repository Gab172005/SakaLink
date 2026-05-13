// src/context/AuthContext.jsx
// Provides { user, userType, isAuthenticated, login, logout } to the whole app.

import { createContext, useContext, useState, useEffect } from "react";
import { getToken, getUserType, saveSession, clearSession, authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]       = useState(() => getToken());
  const [userType, setUserType] = useState(() => getUserType());
  const [user, setUser]         = useState(null);

  const isAuthenticated = !!token;

  // Restore user info from token on page load (optional — backend must support GET /api/auth/me)
  useEffect(() => {
    if (!token) return;
    // If your backend exposes /api/auth/me, uncomment this block:
    // fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/me`, {
    //   headers: { Authorization: `Bearer ${token}` },
    // })
    //   .then((r) => r.json())
    //   .then((data) => setUser(data))
    //   .catch(() => logout());
  }, [token]);

  /**
   * Call this after a successful login API response.
   * data = { token, userType, user? }
   */
  const login = (data) => {
    saveSession(data.token, data.userType);
    setToken(data.token);
    setUserType(data.userType);
    if (data.user) setUser(data.user);
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUserType(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, userType, user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
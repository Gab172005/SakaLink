// src/context/AuthContext.jsx
// Provides { user, userType, isAuthenticated, login, logout } to the whole app.

import { createContext, useContext, useState, useEffect } from "react";
import { getToken, getUserType, saveSession, clearSession, authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // We check for userType or a 'loggedIn' flag in localStorage 
  // since we can't 'read' the HttpOnly cookie via JS.
  const [userType, setUserType] = useState(() => getUserType());
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user_info");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;
  
  //restore user info from token on page load
  useEffect(() => {
    const checkAuth = async () => {
      const savedType = localStorage.getItem("user_type");
      if (!savedType) {
        setLoading(false);
        return;
      }
      try {
        const response = await authAPI.getProfile(); 
        if (response && response.data) {
          setUser(response.data); 
          localStorage.setItem("user_info", JSON.stringify(response.data));
        }
      } catch (err) {
        if (err.response?.status === 401) {
          handleLocalLogout();
        }
      } finally {
        // Stop the loading state regardless of success or failure
        setLoading(false); 
      }
    };

    checkAuth();
  }, []);
  const login = (data) => {
    localStorage.setItem("user_type", data.userType);
    localStorage.setItem("user_info", JSON.stringify(data.user));
    
    setUser(data.user);
    setUserType(data.userType);
  };

  const logout = async () => {
    await authAPI.logout(); 
        localStorage.removeItem("user_type");
    localStorage.removeItem("user_info");
    
    setUser(null);
    setUserType(null);
  };

  return (
  <AuthContext.Provider value={{ userType, user, isAuthenticated, loading, login, logout }}> 
    {children}
  </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
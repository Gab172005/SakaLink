// Provides { user, userType, isAuthenticated, login, logout } to the whole app.
import { createContext, useContext, useState, useEffect } from "react";
import { getUserType, saveSession, clearSession, authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userType, setUserType] = useState(() => getUserType());
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("sakalink_userInfo");
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;
  
  useEffect(() => {
    const checkAuth = async () => {
      const savedType = getUserType();
      if (!savedType) {
        setLoading(false);
        return;
      }
      try {

        const profileData = await authAPI.getProfile(); 
        if (profileData) {
          // profileData is flat: { firstName, lastName, email, userType }
          setUser(profileData); 
          localStorage.setItem("sakalink_userInfo", JSON.stringify(profileData));
          setUserType(profileData.userType);

        }
      } catch (err) {
        // any auth failure (401 invalid token, 404 user deleted) means the session
        // is stale. clear local state so the user is prompted to log in again.
        localStorage.removeItem("user_type");
        localStorage.removeItem("user_info");
        setUser(null);
        setUserType(null);
      } finally {
        setLoading(false); 
      }
    };

    checkAuth();
  }, []);

  const login = (data) => {
    if (!data) return;
    const activeUser = data.user ? data.user : data;
    const activeType = data.userType || activeUser.userType || "customer";

    saveSession(data.token || "true", activeType);
    localStorage.setItem("sakalink_userInfo", JSON.stringify(activeUser));
    
    setUser(activeUser);
    setUserType(activeType);
    setLoading(false);
  };

  const handleLocalLogout = () => {
    clearSession();
    localStorage.removeItem("sakalink_userInfo");
    setUser(null);
    setUserType(null);
    setLoading(false);
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch (err) {} 
    handleLocalLogout();
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
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
  
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem("sakalink_userInfo");
  });
  const isAuthenticated = !!user;
  
  useEffect(() => {
    const checkAuth = async () => {
      const savedType = getUserType();
      if (!savedType) {
        setLoading(false);
        return;
      }
      try {
        const responseData = await authAPI.getProfile(); 
        
        if (responseData && responseData.user) {
          const actualUser = responseData.user;
          const actualType = responseData.userType || responseData.user.userType || "customer";

          setUser(actualUser); 
          setUserType(actualType);
          localStorage.setItem("sakalink_userInfo", JSON.stringify(actualUser));
        }
      } catch (err) {
        clearSession(); 
        localStorage.removeItem("sakalink_userInfo");
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
    
    const activeUser = data.user ? { ...data.user } : { ...data };
    const activeType = data.userType || activeUser.userType || "customer";

    // Ensure user object has userType
    activeUser.userType = activeType;

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
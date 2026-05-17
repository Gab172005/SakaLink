import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import Hero from "./components/HeroPage/Hero";
import Footer from "./components/HeroPage/Footer";
import LoginModal from "./components/HeroPage/LoginModal";
import SignupModal from "./components/HeroPage/SignupModal";
import Toast from "./components/HeroPage/Toast";
import MarketplacePage from "./pages/MarketPage/MarketplacePage";
import CartModal from "./components/MarketPage/CartModal";
import UserProfilePage from "./pages/ProfilePage/UserProfilePage";
import SettingsPage from "./pages/SettingsPage/SettingsPage";
import AdminDashboard from "./components/admin/AdminDashboard"; 
import "./App.css";

function LandingPage({ openModal }) {
  return (
    <>
      <Hero openModal={openModal} />
      <Footer />
    </>
  );
}

function AppContent() {
  // FIX: Destructure userType directly from the hook context
  const { user, userType } = useAuth();
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const openModal = (type) => setModal(type);
  const closeModal = () => setModal(null);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
  }, [modal]);

  return (
    <>
      <Navbar openModal={openModal} openCart={() => openModal("cart")} />
      
      <Routes>
        <Route path="/" element={<LandingPage openModal={openModal} />} />
        <Route 
          path="/shop" 
          element={
            <ProtectedRoute>
              <MarketplacePage showToast={showToast} />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              {/* FIX: Evaluate userType directly instead of user?.userType */}
              {userType === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )}
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Toast visible={toast.visible} message={toast.message} />
      
      <LoginModal
        active={modal === "login"}
        onClose={closeModal}
        onSwitch={() => openModal("signup")}
        showToast={showToast}
      />
      
      <SignupModal
        active={modal === "signup"}
        onClose={closeModal}
        onSwitch={() => openModal("login")}
        showToast={showToast}
      />
      
      <CartModal
        isOpen={modal === "cart"}
        onClose={closeModal}
        showToast={showToast}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
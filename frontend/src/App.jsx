import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/HeroPage/Navbar";
import Hero from "./components/HeroPage/Hero";
import Footer from "./components/HeroPage/Footer";
import LoginModal from "./components/HeroPage/LoginModal";
import SignupModal from "./components/HeroPage/SignupModal";
import MarketplacePage from "./pages/MarketPage/MarketplacePage";
import "./App.css";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const modal = location.pathname === "/login"
    ? "login"
    : location.pathname === "/signup"
    ? "signup"
    : null;

  const openModal = (type) => navigate(`/${type}`);
  const closeModal = () => navigate("/");

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
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={
          <>
            <Navbar openModal={openModal} />
            <Hero openModal={openModal} />
            <Footer />
          </>
        } />
        <Route path="/browse" element={<MarketplacePage />} />
        <Route path="*" element={<div style={{ padding: "2rem" }}>Page Not Found</div>} />
      </Routes>
      <LoginModal
        active={modal === "login"}
        onClose={closeModal}
        onSwitch={() => openModal("signup")}
        showToast={toast}
      />
      <SignupModal
        active={modal === "signup"}
        onClose={closeModal}
        onSwitch={() => openModal("login")}
        showToast={toast}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
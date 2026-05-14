import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/MarketPage/Navbar";
import Hero from "./components/HeroPage/Hero";
import Footer from "./components/HeroPage/Footer";
import LoginModal from "./components/HeroPage/LoginModal";
import SignupModal from "./components/HeroPage/SignupModal";
import Toast from "./components/Toast";
import MarketplacePage from "./pages/MarketPage/MarketplacePage";
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
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [cart, setCart] = useState([]);

  const openModal = (type) => setModal(type);
  const closeModal = () => setModal(null);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
    showToast(`Added ${product.name} to cart! 🛒`);
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
      <Navbar openModal={openModal} cartCount={cart.length} />
      
      <Routes>
        <Route path="/" element={<LandingPage openModal={openModal} />} />
        <Route path="/shop" element={<MarketplacePage addToCart={addToCart} />} />
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

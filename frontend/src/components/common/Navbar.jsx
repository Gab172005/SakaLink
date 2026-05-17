import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import styles from './Navbar.module.css';

export default function Navbar({ openModal, openCart }) {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // close dropdown when clicking outside
  // FIX: useEffect must be called before any early return (Rules of Hooks)
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // early return goes here (AFTER all hooks)
  if (loading) return null;

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/");
  };

  const goTo = (path) => navigate(path);
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={() => goTo('/')} style={{ cursor: 'pointer' }}>
        <span className={styles.logoIcon}>🌿</span>
        <span className={styles.logoText}>Saka<span className={styles.logoAccent}>Link</span></span>
      </div>

      <div className={styles.actions}>
        {isAuthenticated ? (
          <div className={styles.navGroup}>
            <button 
              className={`${styles.iconBtn} ${isActive('/shop') ? styles.activeLink : ''}`} 
              onClick={() => goTo('/shop')}
            >
              Market
            </button>

            <button 
              className={`${styles.iconBtn} ${isActive('/settings') ? styles.activeLink : ''}`} 
              title="Settings" 
              onClick={() => goTo('/settings')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>

            <button 
              className={`${styles.iconBtn} ${isActive('/cart') ? styles.activeLink : ''}`} 
              title="Cart" 
              style={{ position: 'relative' }} 
              onClick={openCart}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>

            {/* Pill button opens dropdown with My Profile + Logout */}
            <div className={styles.pillWrapper} ref={dropdownRef}>
              <button
                className={styles.pillBox}
                onClick={() => setDropdownOpen((o) => !o)}
                title="Account"
              >
                <span className={styles.pillDot} style={{ background: '#ffffff' }}></span>
                <span className={styles.pillLabel}>{user?.firstName}</span>
              </button>

              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => { setDropdownOpen(false); goTo('/profile'); }}
                  >
                    My Profile
                  </button>
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>

            <button 
              className={`${styles.iconBtn} ${isActive('/notifications') ? styles.activeLink : ''}`} 
              title="Notifications" 
              onClick={() => goTo('/notifications')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className={styles.navGroup}>
            <button className={styles.iconBtn} onClick={() => openModal("login")}>Sign In</button>
            <button className={styles.pillBox} onClick={() => openModal("signup")}>
              <span className={styles.pillDot}></span>
              <span className={styles.pillLabel}>Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
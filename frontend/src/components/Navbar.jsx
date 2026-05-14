import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar({ openModal, cartCount = 0 }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link className="logo" to="/">
        Saka<span>Link</span>
      </Link>
      <ul className="nav-links">
        <li><Link to="/shop">Market</Link></li>
        <li><a href="#">Farmers</a></li>
        {isAuthenticated ? (
          <li>
            <a href="#" onClick={handleLogout}>
              Logout
            </a>
          </li>
        ) : (
          <>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); openModal("signup"); }}>
                Sign Up
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); openModal("login"); }}>
                Sign In
              </a>
            </li>
          </>
        )}
        <li className="cart-item">
          <Link to="/cart" className="cart-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </li>
      </ul>
    </nav>
  );
}

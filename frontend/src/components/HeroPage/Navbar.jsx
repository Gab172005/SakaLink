import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

export default function Navbar({ openModal }) {
  const { isAuthenticated, logout } = useAuth();

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
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
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
      </ul>
    </nav>
  );
}

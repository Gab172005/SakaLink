import "./Navbar.css";

export default function Navbar({ openModal }) {
  return (
    <nav className="navbar">
      <a className="logo" href="#">
        Saka<span>Link</span>
      </a>
      <ul className="nav-links">
        <li><a href="#">Market</a></li>
        <li><a href="#">Farmers</a></li>
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
      </ul>
    </nav>
  );
}
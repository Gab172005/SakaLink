import { useState, useEffect } from "react";
import { authAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Modal.css";

export default function SignupModal({ active, onClose, onSwitch, showToast }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const handler = (e) => { if (e.key === "Enter") handleSignup(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, firstName, lastName, email, password, confirmPassword]);

  async function handleSignup() {
    setError("");

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.register(firstName, lastName, email, password);
      login(data);
      onClose();
      showToast("Welcome to SakaLink!");
      navigate("/shop");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`modal-overlay ${active ? "active" : ""}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose}>&#x2715;</button>
        <h2 className="modal-title">Create account</h2>
        <p className="modal-subtitle">Join SakaLink and shop fresh produce today</p>

        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" placeholder="Juan" value={firstName}
              onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" placeholder="Dela Cruz" value={lastName}
              onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Email address</label>
          <input type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={error && !/\S+@\S+\.\S+/.test(email) ? "error" : ""} />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={error && password.length < 6 ? "error" : ""} />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input type="password" placeholder="••••••••" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={error && confirmPassword !== password ? "error" : ""} />
        </div>

        {error && <div className="form-error-msg">{error}</div>}

        <button className="btn-form" onClick={handleSignup} disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? "Creating account…" : "Create Account"}
        </button>

        <div className="modal-switch">
          Already have an account?{" "}
          <a onClick={() => { onClose(); setTimeout(onSwitch, 100); }}>Sign in</a>
        </div>
      </div>
    </div>
  );
}
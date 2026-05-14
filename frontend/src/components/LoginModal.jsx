import { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Modal.css";

export default function LoginModal({ active, onClose, onSwitch, showToast }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) {
      setEmail("");
      setPassword("");
      setError("");
      setLoading(false);
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const handler = (e) => { if (e.key === "Enter") handleLogin(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, email, password]);

  async function handleLogin() {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.login(email, password);

      // Persist token + userType via context
      login(data);
      onClose();
      showToast("Welcome back! 🌿");

      setTimeout(() => {
        window.location.href = data.userType === "admin" ? "/admin/dashboard" : "/shop";
      }, 1000);
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
        <h2 className="modal-title">Welcome back</h2>
        <p className="modal-subtitle">Sign in to your SakaLink account</p>

        <div className="form-group">
          <label>Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={error ? "error" : ""}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={error ? "error" : ""}
          />
        </div>

        {error && <div className="form-error-msg">{error}</div>}

        <button className="btn-form" onClick={handleLogin} disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <div className="modal-switch">
          No account?{" "}
          <a onClick={() => { onClose(); setTimeout(onSwitch, 100); }}>Create one</a>
        </div>
      </div>
    </div>
  );
}
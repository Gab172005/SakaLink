import React from "react";
import { useNavigate } from "react-router-dom";
import "./TopBar.css";

const LeafIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2C6.5 2 3 7 3 12c0 3.5 2 6.5 5 8l1-3c-1.5-1-2.5-2.8-2.5-5 0-3.3 2.2-6.5 5.5-6.5s5.5 3.2 5.5 6.5c0 2.2-1 4-2.5 5l1 3c3-1.5 5-4.5 5-8 0-5-3.5-10-9.5-10z"
      fill="currentColor"
    />
    <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export default function TopBar() {
  const navigate = useNavigate();
  
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="topbar-logo">
          <LeafIcon />
        </div>
        <span className="topbar-wordmark">
          Saka<span>Link</span>
        </span>
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" aria-label="Settings" onClick={() => navigate('/settings')}>
          <SettingsIcon />
        </button>

        <div className="topbar-user-toggle">
          <span className="toggle-thumb" />
          <span className="toggle-label">User</span>
        </div>

        <button className="topbar-icon-btn topbar-bell" aria-label="Notifications">
          <BellIcon />
          <span className="bell-dot" />
        </button>
      </div>
    </header>
  );
}

// Slide-in overlay shown when the bell icon is clicked in the navbar.

import { useState, useEffect } from 'react';
import { notificationsAPI } from '../../services/api';
import styles from './NotificationOverlay.module.css';

// Bell icon used per notification row
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

// Relative time label, ex. "5m", "2h", "3d"
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function NotificationOverlay({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [tab,           setTab]           = useState('all'); // 'all' | 'unread'
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    notificationsAPI.getAll()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const visible = tab === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    // Backdrop —> clicking outside closes the overlay
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Notifications</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'all' ? styles.tabActive : ''}`}
            onClick={() => setTab('all')}
          >
            All
          </button>
          <button
            className={`${styles.tab} ${tab === 'unread' ? styles.tabActive : ''}`}
            onClick={() => setTab('unread')}
          >
            Unread {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>

          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className={styles.list}>
          {loading ? (
            <div className={styles.empty}><span className={styles.spinner} /></div>
          ) : visible.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyText}>No notifications</p>
            </div>
          ) : (
            visible.map((n) => (
              <div
                key={n._id}
                className={`${styles.row} ${!n.isRead ? styles.rowUnread : ''}`}
                onClick={() => !n.isRead && handleMarkRead(n._id)}
              >
                <div className={styles.iconWrap}><BellIcon /></div>
                <div className={styles.body}>
                  <p className={styles.message}>{n.message}</p>
                </div>
                <div className={styles.meta}>
                  <span className={styles.time}>{timeAgo(n.createdAt)}</span>
                  {!n.isRead && <span className={styles.dot} />}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
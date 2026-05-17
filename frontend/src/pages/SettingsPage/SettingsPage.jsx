import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './SettingsPage.module.css';

export default function SettingsPage({ showToast }) {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    language: 'en',
    currency: 'PHP'
  });

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    showToast(`${key} updated!`);
  };

  const handleSelectChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    showToast(`${key} changed to ${value}`);
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully!');
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsContent}>
        <h1 className={styles.title}>Settings</h1>
        
        {user && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Account Information</h2>
            <div className={styles.accountInfo}>
              <div className={styles.infoRow}>
                <label>Name</label>
                <span>{user.firstName} {user.lastName}</span>
              </div>
              <div className={styles.infoRow}>
                <label>Email</label>
                <span>{user.email}</span>
              </div>
              <div className={styles.infoRow}>
                <label>User Type</label>
                <span className={styles.badge}>{user.userType}</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Notifications</h2>
          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <label>Email Notifications</label>
              <p className={styles.settingDesc}>Receive email updates about orders and promotions</p>
            </div>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <label>Push Notifications</label>
              <p className={styles.settingDesc}>Get real-time alerts on your device</p>
            </div>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        {/* <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Preferences</h2>
          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <label>Language</label>
              <p className={styles.settingDesc}>Choose your preferred language</p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => handleSelectChange('language', e.target.value)}
              className={styles.select}
            >
              <option value="en">English</option>
              <option value="fil">Filipino</option>
              <option value="es">Spanish</option>
            </select>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <label>Currency</label>
              <p className={styles.settingDesc}>Default currency for prices</p>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => handleSelectChange('currency', e.target.value)}
              className={styles.select}
            >
              <option value="PHP">Philippine Peso (₱)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <label>Dark Mode</label>
              <p className={styles.settingDesc}>Use dark theme for the interface</p>
            </div>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={() => handleToggle('darkMode')}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div> */}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

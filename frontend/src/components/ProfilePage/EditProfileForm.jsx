// Lets the user update their first name and last name (email and password changes are not permitted).
 
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import styles from './EditProfileForm.module.css';

export default function EditProfileForm({ onBack }) {
  const { user, login } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName,  setLastName]  = useState(user?.lastName  ?? '');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('All fields are required.');
      return;
    }

    setSaving(true);
    try {
      const data = await authAPI.updateProfile({
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
      });

      // Update AuthContext so the navbar reflects the name change immediately
      // The 'data' object now contains both 'user' and 'userType' from the backend fix
      login(data);

      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <button className={styles.backBtn} onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Profile
        </button>

        <div className={styles.card}>
          <h2 className={styles.title}>Edit Profile</h2>
          <p className={styles.sub}>Update your account details below.</p>

          <div className={styles.formRow}>
            <div className={styles.group}>
              <label className={styles.label}>First Name</label>
              <input
                className={styles.input}
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Last Name</label>
              <input
                className={styles.input}
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          {error   && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <div className={styles.actions}>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving && <span className={styles.spinner} />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button className={styles.cancelBtn} onClick={onBack}>Cancel</button>
          </div>
        </div>

      </div>
    </div>
  );
}
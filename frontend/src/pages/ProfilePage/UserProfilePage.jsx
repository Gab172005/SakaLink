// Shows the logged-in user's profile summary and recent orders.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI, authAPI } from '../../services/api';
import EditProfileForm from '../../components/ProfilePage/EditProfileForm';
import PurchaseHistory from '../../components/ProfilePage/PurchaseHistory';
import styles from './UserProfilePage.module.css';

// which sub-view is active
const VIEW = { MAIN: 'main', EDIT: 'edit', HISTORY: 'history' };

export default function UserProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState(VIEW.MAIN);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  // fetch the user's orders once on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await ordersAPI.getMyOrders();
        // API returns array directly or wrapped — handle both shapes
        setOrders(Array.isArray(data) ? data : data.orders ?? []);
      } catch (err) {
        setOrdersError('Could not load orders.');
      } finally {
        setOrdersLoading(false);
      }
    };
    load();
  }, []);

  // show the 3 most recent orders on the summary view
  const recentOrders = orders.slice(0, 3);

  if (view === VIEW.EDIT) {
    return <EditProfileForm onBack={() => setView(VIEW.MAIN)} />;
  }

  if (view === VIEW.HISTORY) {
    return (
      <PurchaseHistory
        orders={orders}
        loading={ordersLoading}
        error={ordersError}
        onBack={() => setView(VIEW.MAIN)}
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Left column: account details ── */}
        <aside className={styles.sidebar}>
          <div className={styles.avatarRing}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>

          <h2 className={styles.welcome}>
            Welcome Back, {user?.firstName}
          </h2>
          <p className={styles.welcomeSub}>Here's a summary of your recent purchases.</p>

          <div className={styles.detailsCard}>
            <h3 className={styles.detailsTitle}>Account Details</h3>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>First Name</span>
              <span className={styles.fieldValue}>{user?.firstName}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Last Name</span>
              <span className={styles.fieldValue}>{user?.lastName}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Email Address</span>
              <span className={styles.fieldValue}>{user?.email}</span>
            </div>

            <button
              className={styles.editBtn}
              onClick={() => setView(VIEW.EDIT)}
            >
              Edit Account
            </button>
          </div>
        </aside>

        {/* ── Right column: recent purchases ── */}
        <main className={styles.main}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Purchases</h3>
            <button
              className={styles.viewAllBtn}
              onClick={() => setView(VIEW.HISTORY)}
            >
              View Full History
            </button>
          </div>

          {ordersLoading ? (
            <div className={styles.stateBox}>
              <span className={styles.spinner} />
              <p>Loading orders…</p>
            </div>
          ) : ordersError ? (
            <div className={styles.stateBox}>
              <p className={styles.errorText}>{ordersError}</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className={styles.emptyBox}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" className={styles.emptyIcon}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className={styles.emptyTitle}>No purchases yet</p>
              <p className={styles.emptyMsg}>
                Head to the market to place your first order.
              </p>
              <button className={styles.shopBtn} onClick={() => navigate('/shop')}>
                Go to Market
              </button>
            </div>
          ) : (
            <div className={styles.orderList}>
              {recentOrders.map((order) => (
                <OrderRow key={order._id} order={order} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

// a single order row used in the summary view
function OrderRow({ order }) {
  const product = order.productId;
  const date = new Date(order.createdAt).toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const STATUS_MAP = {
    0: { label: 'Pending',   cls: 'pending'   },
    1: { label: 'Delivered', cls: 'delivered' },
    2: { label: 'Cancelled', cls: 'cancelled' },
  };
  const status = STATUS_MAP[order.status] ?? STATUS_MAP[0];

  return (
    <div className={styles.orderRow}>
      {/* Product image or placeholder */}
      <div className={styles.productThumb}>
        {product?.image
          ? <img src={product.image} alt={product?.name} />
          : <span className={styles.thumbPlaceholder}>🌿</span>
        }
      </div>

      <div className={styles.orderInfo}>
        <span className={styles.productName}>{product?.name ?? 'Product'}</span>
        <span className={styles.orderMeta}>
          ORDER #{order._id?.slice(-6).toUpperCase()} · {date}
        </span>
      </div>

      <div className={styles.orderRight}>
        <span className={styles.orderPrice}>
          ₱{Number(order.totalPrice).toFixed(2)}
        </span>
        <span className={`${styles.statusBadge} ${styles[status.cls]}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
}
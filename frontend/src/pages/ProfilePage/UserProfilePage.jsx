// Shows the logged-in user's profile summary and recent orders.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI} from '../../services/api';
import EditProfileForm from '../../components/ProfilePage/EditProfileForm';
import PurchaseHistory from '../../components/ProfilePage/PurchaseHistory';
import OrderDetailOverlay from '../../components/ProfilePage/OrderDetailOverlay';
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null); // which order is open in the detail overlay (summary view)

  // fetch the user's orders whenever the component mounts or refreshTrigger changes
  useEffect(() => {
    const load = async () => {
      setOrdersLoading(true);
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
  }, [refreshTrigger]);

  // Listen for successful checkouts from other components
  useEffect(() => {
    const handleCheckoutSuccess = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener('checkout-success', handleCheckoutSuccess);
    return () => window.removeEventListener('checkout-success', handleCheckoutSuccess);
  }, []);

  // update a cancelled order's status in local state
  const handleCancelled = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: 3 } : o))
    );
  };

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
    <>
      <div className={styles.page}>
        <div className={styles.container}>

          {/* ── Left column: account details ── */}
          <aside className={styles.sidebar}>
            <div className={styles.avatarRing}>
              <span className={styles.avatarInitials}>
                {(user?.firstName?.[0] ?? '').toUpperCase()}
                {(user?.lastName?.[0] ?? '').toUpperCase()}
              </span>
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
                  <OrderRow key={order._id} order={order} onClick={() => setSelectedOrder(order)} />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>

      {/* Order detail overlay — opens when a summary row is clicked */}
      {selectedOrder && (
        <OrderDetailOverlay
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancelled={handleCancelled}
        />
      )}
    </>
  );
}

// a single order row used in the summary view, clickable to open detail overlay
function OrderRow({ order, onClick }) {
  const date = new Date(order.createdAt).toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const STATUS_MAP = {
    0: { label: 'Pending',          cls: 'pending'   },
    1: { label: 'Out for Delivery', cls: 'delivery'  },
    2: { label: 'Delivered',        cls: 'delivered' },
    3: { label: 'Cancelled',        cls: 'cancelled' },
  };
  const status = STATUS_MAP[order.status] ?? STATUS_MAP[0];

  return (
    <div className={styles.orderRow} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      {/* Product image */}
      <div className={styles.productThumb}>
        {order.items?.[0]?.productId?.image
          ? <img src={order.items[0].productId.image} alt={order.items[0].name} />
          : <span className={styles.thumbPlaceholder}>🌿</span>
        }
      </div>

      <div className={styles.orderInfo}>
        <span className={styles.productName}>
          {order.items?.[0]?.name ?? 'Product'}
          {(order.items?.length ?? 1) > 1 && (
            <span className={styles.moreTag}> +{order.items.length - 1} more</span>
          )}
        </span>
        <span className={styles.orderMeta}>
          ORDER #{order._id?.slice(-6).toUpperCase()} · {date}
        </span>
      </div>

      <div className={styles.orderRight}>
        <span className={styles.orderPrice}>₱{Number(order.totalToPay).toFixed(2)}</span>
        <span className={`${styles.statusBadge} ${styles[status.cls]}`}>
          <span className={styles.dot} />
          {status.label}
        </span>
      </div>
    </div>
  );
}
// Full scrollable list of all orders for the logged-in user.
// Receives pre-fetched order data from the parent (UserProfilePage) so it doesn't re-fetch on every open.

import { useNavigate } from 'react-router-dom';
import styles from './PurchaseHistory.module.css';

const STATUS_MAP = {
  0: { label: 'Pending',   cls: 'pending'   },
  1: { label: 'Out for Delivery', cls: 'pending' },
  2: { label: 'Delivered', cls: 'delivered' },
  3: { label: 'Cancelled', cls: 'cancelled' },
};

export default function PurchaseHistory({ orders, loading, error, onBack }) {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Back button */}
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Profile
        </button>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.title}>Purchase History</h2>
              <p className={styles.sub}>A detailed record of your sustainable journey so far.</p>
            </div>
            {!loading && !error && orders.length > 0 && (
              <span className={styles.count}>{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {/* ── Table header ── */}
          {!loading && !error && orders.length > 0 && (
            <div className={styles.tableHeader}>
              <span>DATE &amp; ID</span>
              <span>PRODUCT</span>
              <span>TOTAL</span>
              <span>STATUS</span>
            </div>
          )}

          {/* ── Content ── */}
          <div className={styles.listWrapper}>
            {loading ? (
              <div className={styles.stateBox}>
                <span className={styles.spinner} />
                <p>Loading your orders…</p>
              </div>
            ) : error ? (
              <div className={styles.stateBox}>
                <p className={styles.errorText}>{error}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyBox}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" className={styles.emptyIcon}>
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <p className={styles.emptyTitle}>No purchases yet</p>
                <p className={styles.emptyMsg}>
                  You haven't placed any orders. Head to the market to get started!
                </p>
                <button className={styles.shopBtn} onClick={() => navigate('/shop')}>
                  Go to Market
                </button>
              </div>
            ) : (
              <div className={styles.orderList}>
                {orders.map((order) => (
                  <HistoryRow key={order._id} order={order} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function HistoryRow({ order }) {
  const firstItem = order.items?.[0];
  const product = firstItem?.productId;
  const otherItemsCount = (order.items?.length || 1) - 1;

  const date = new Date(order.createdAt).toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
  const shortId = '#' + (order._id?.slice(-4).toUpperCase() ?? 'XXXX');
  const status  = STATUS_MAP[order.status] ?? STATUS_MAP[0];

  const totalItems = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className={styles.row}>
      {/* Date + ID */}
      <div className={styles.dateCell}>
        <span className={styles.dateText}>{date}</span>
        <span className={styles.idText}>{shortId}</span>
      </div>

      {/* Product */}
      <div className={styles.productCell}>
        <div className={styles.thumb}>
          {product?.image
            ? <img src={product.image} alt={firstItem?.name} />
            : <span className={styles.thumbPlaceholder}>🌿</span>
          }
        </div>
        <span className={styles.productName}>
          {firstItem?.name ?? 'Product'}
          {otherItemsCount > 0 && ` + ${otherItemsCount} more`}
        </span>
      </div>

      {/* Price */}
      <div className={styles.priceCell}>
        <span className={styles.price}>₱{Number(order.totalToPay).toFixed(2)}</span>
        <span className={styles.qty}>{totalItems} Item{totalItems !== 1 ? 's' : ''}</span>
      </div>

      {/* Status */}
      <div className={styles.statusCell}>
        <span className={`${styles.badge} ${styles[status.cls]}`}>
          <span className={styles.dot} />
          {status.label}
        </span>
      </div>
    </div>
  );
}
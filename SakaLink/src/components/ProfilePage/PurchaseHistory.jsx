// Full scrollable list of all orders. Clicking a row opens OrderDetailOverlay.
// Receives pre-fetched order data from UserProfilePage to avoid re-fetching.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderDetailOverlay from './OrderDetailOverlay';
import styles from './PurchaseHistory.module.css';

const STATUS_MAP = {
  0: { label: 'Pending',          cls: 'pending'   },
  1: { label: 'Out for Delivery', cls: 'delivery'  },
  2: { label: 'Delivered',        cls: 'delivered' },
  3: { label: 'Cancelled',        cls: 'cancelled' },
};

export default function PurchaseHistory({ orders: initialOrders, loading, error, onBack }) {
  const navigate = useNavigate();
  const [orders,       setOrders]       = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // update a single order's status in local state after cancellation
  const handleCancelled = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: 3 } : o))
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

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

          {/* Table header */}
          {!loading && !error && orders.length > 0 && (
            <div className={styles.tableHeader}>
              <span>DATE &amp; ID</span>
              <span>ITEMS</span>
              <span>TOTAL</span>
              <span>STATUS</span>
            </div>
          )}

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
                <p className={styles.emptyMsg}>Head to the market to get started!</p>
                <button className={styles.shopBtn} onClick={() => navigate('/shop')}>
                  Go to Market
                </button>
              </div>
            ) : (
              <div className={styles.orderList}>
                {orders.map((order) => (
                  <HistoryRow
                    key={order._id}
                    order={order}
                    onClick={() => setSelectedOrder(order)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order detail overlay */}
      {selectedOrder && (
        <OrderDetailOverlay
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancelled={handleCancelled}
        />
      )}
    </div>
  );
}

function HistoryRow({ order, onClick }) {
  const date    = new Date(order.createdAt).toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
  const shortId = '#' + (order._id?.slice(-4).toUpperCase() ?? 'XXXX');
  const status  = STATUS_MAP[order.status] ?? STATUS_MAP[0];
  const items   = order.items ?? [];

  // show up to 2 item names, then "+N more" if there are additional
  const displayItems = items.slice(0, 2);
  const extraCount   = items.length - displayItems.length;

  return (
    <div className={styles.row} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>

      {/* Date + ID */}
      <div className={styles.dateCell}>
        <span className={styles.dateText}>{date}</span>
        <span className={styles.idText}>{shortId}</span>
      </div>

      {/* Items — stacked names with thumbnails of first item */}
      <div className={styles.productCell}>
        <div className={styles.thumb}>
          {items[0]?.productId?.image
            ? <img src={items[0].productId.image} alt={items[0].name} />
            : <span className={styles.thumbPlaceholder}>🌿</span>
          }
        </div>
        <div className={styles.itemNames}>
          {displayItems.map((item, i) => (
            <span key={i} className={styles.itemName}>{item.name}</span>
          ))}
          {extraCount > 0 && (
            <span className={styles.moreTag}>+{extraCount} more item{extraCount > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Price + item count */}
      <div className={styles.priceCell}>
        <span className={styles.price}>₱{Number(order.totalToPay).toFixed(2)}</span>
        <span className={styles.qty}>{items.reduce((a, i) => a + i.quantity, 0)} item{items.reduce((a, i) => a + i.quantity, 0) !== 1 ? 's' : ''}</span>
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
// Overlay showing full order details (shows a cancel order button if order is pending).

import { useState } from 'react';
import { ordersAPI } from '../../services/api';
import styles from './OrderDetailOverlay.module.css';

const STATUS_MAP = {
  0: { label: 'Pending',          cls: 'pending'   },
  1: { label: 'Out for Delivery', cls: 'delivery'  },
  2: { label: 'Delivered',        cls: 'delivered' },
  3: { label: 'Cancelled',        cls: 'cancelled' },
};

export default function OrderDetailOverlay({ order, onClose, onCancelled }) {
  const [confirming, setConfirming] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const status  = STATUS_MAP[order.status] ?? STATUS_MAP[0];
  const date    = new Date(order.createdAt).toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
  const shortId = '#' + (order._id?.slice(-6).toUpperCase() ?? 'XXXXXX');

  const handleCancel = async () => {
    setLoading(true);
    setError('');
    try {
      await ordersAPI.cancelOrder(order._id);
      onCancelled(order._id); // tell parent to update local state
      onClose();
    } catch (err) {
      setError('Failed to cancel order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop (clicking outside closes the overlay)
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Order Details</h2>
            <span className={styles.orderId}>{shortId} · {date}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9"  y1="9" x2="15" y2="15"/>
            </svg>
          </button>
        </div>

        {/* Status badge */}
        <div className={styles.statusRow}>
          <span className={`${styles.badge} ${styles[status.cls]}`}>
            <span className={styles.dot} />
            {status.label}
          </span>
        </div>

        {/* Items list */}
        <div className={styles.itemsSection}>
          <p className={styles.sectionLabel}>Items Ordered</p>
          <div className={styles.itemList}>
            {order.items?.map((item, i) => (
              <div key={i} className={styles.item}>
                <div className={styles.itemThumb}>
                  {item.productId?.image
                    ? <img src={item.productId.image} alt={item.name} />
                    : <span>🌿</span>
                  }
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemQty}>Qty: {item.quantity}</span>
                </div>
                <span className={styles.itemPrice}>
                  ₱{(item.priceAtPurchase * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValue}>₱{Number(order.totalToPay).toFixed(2)}</span>
        </div>

        {/* Delivery & payment info */}
        <div className={styles.metaSection}>
          {order.deliveryAddress && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Delivery Address</span>
              <span className={styles.metaValue}>{order.deliveryAddress}</span>
            </div>
          )}
          {order.paymentMethod && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Payment Method</span>
              <span className={styles.metaValue}>{order.paymentMethod}</span>
            </div>
          )}
        </div>

        {/* Cancel button — only shown for pending orders */}
        {order.status === 0 && !confirming && (
          <button className={styles.cancelBtn} onClick={() => setConfirming(true)}>
            Cancel Order
          </button>
        )}

        {/* Confirmation prompt */}
        {confirming && (
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>Are you sure you want to cancel this order?</p>
            {error && <p className={styles.errorText}>{error}</p>}
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmYes}
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
              <button
                className={styles.confirmNo}
                onClick={() => setConfirming(false)}
                disabled={loading}
              >
                No, Keep It
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
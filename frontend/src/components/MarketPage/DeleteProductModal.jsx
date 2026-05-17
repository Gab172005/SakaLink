import styles from './DeleteProductModal.module.css';

export default function DeleteProductModal({ open, product, onConfirm, onCancel, loading }) {
  if (!open || !product) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onCancel} aria-label="Close delete modal">
          ✕
        </button>

        <div className={styles.iconWrapper}>
          <div className={styles.icon}>!</div>
        </div>
        <h2 className={styles.title}>Delete product?</h2>
        <p className={styles.message}>
          Are you sure you want to remove <strong>{product.name}</strong> from the marketplace? This action cannot be undone.
        </p>

        <div className={styles.productSummary}>
          <div className={styles.productName}>{product.name}</div>
          <div className={styles.productMeta}>{product.region || 'Unknown region'} · {product.unit || 'unit'}</div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={styles.confirmBtn}
            type="button"
            onClick={() => onConfirm(product.id || product._id)}
            disabled={loading}
          >
            {loading ? 'Deleting…' : 'Delete product'}
          </button>
        </div>
      </div>
    </div>
  );
}

import styles from './ProductDetailModal.module.css';

const LEAF_COLORS = [
  '#7acc5f', '#8dd96a', '#6abb52', '#93d96f', '#5fb848',
];

function ProductImage({ id, name }) {
  const color = LEAF_COLORS[id % LEAF_COLORS.length];
  return (
    <div className={styles.imagePlaceholder} style={{ background: `linear-gradient(135deg, ${color}dd, ${color}99)` }}>
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 8C20 8 10 20 10 34c0 10 7 18 16 20v-8c-5-2-9-7-9-12 0-9 7-16 15-16 8 0 15 7 15 16 0 5-4 10-9 12v8c9-2 16-10 16-20 0-14-10-26-22-26z" fill="white" fillOpacity="0.6"/>
        <path d="M30 56V32M30 32C26 28 20 28 18 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.7"/>
      </svg>
    </div>
  );
}

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} title="Close">
          ✕
        </button>
        
        <div className={styles.content}>
          <div className={styles.imageSection}>
            <ProductImage id={product.id} name={product.name} />
          </div>
          
          <div className={styles.infoSection}>
            <h2 className={styles.title}>{product.name}</h2>
            
            <div className={styles.price}>
              <span className={styles.amount}>₱{product.price}</span>
              <span className={styles.unit}>per {product.unit}</span>
            </div>

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Category:</span>
                <span className={styles.value}>{product.category}</span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.label}>Location:</span>
                <span className={styles.value}>{product.location}</span>
              </div>
              
              <div className={styles.detailRow}>
                <span className={styles.label}>Region:</span>
                <span className={styles.value}>{product.region}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.label}>Certifications:</span>
                <div className={styles.certifications}>
                  {product.certifications && product.certifications.length > 0 ? (
                    product.certifications.map((cert, idx) => (
                      <span key={idx} className={styles.badge}>{cert}</span>
                    ))
                  ) : (
                    <span className={styles.value}>No certifications</span>
                  )}
                </div>
              </div>
            </div>

            <button className={styles.addBtn} onClick={handleAddToCart}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

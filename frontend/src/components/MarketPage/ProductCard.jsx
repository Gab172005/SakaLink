import styles from './ProductCard.module.css';

const LEAF_COLORS = [
  '#7acc5f', '#8dd96a', '#6abb52', '#93d96f', '#5fb848',
];

function ProductImage({ id, name }) {
  const color = LEAF_COLORS[id % LEAF_COLORS.length];
  return (
    <div className={styles.imagePlaceholder} style={{ background: `linear-gradient(135deg, ${color}dd, ${color}99)` }}>
      <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 8C20 8 10 20 10 34c0 10 7 18 16 20v-8c-5-2-9-7-9-12 0-9 7-16 15-16 8 0 15 7 15 16 0 5-4 10-9 12v8c9-2 16-10 16-20 0-14-10-26-22-26z" fill="white" fillOpacity="0.6"/>
        <path d="M30 56V32M30 32C26 28 20 28 18 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.7"/>
      </svg>
    </div>
  );
}

export default function ProductCard({ product, onSelectProduct }) {
  const handleCardClick = () => {
    onSelectProduct?.(product);
  };

  return (
    <article className={styles.card} onClick={handleCardClick}>
      <ProductImage id={product.id} name={product.name} />
      <div className={styles.body}>
        <div className={styles.info}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.location}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {product.location}
          </p>
        </div>
        <div className={styles.footer}>
          <span className={styles.price}>
            ₱{product.price} <span className={styles.unit}>/ {product.unit}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
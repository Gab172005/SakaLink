import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ products, onAddToCart, onSelectProduct, showToast }) {
  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🌱</span>
        <p>No products found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {products.map((product, i) => (
        <div key={product.id || product._id} style={{ animationDelay: `${i * 0.04}s` }}>
          <ProductCard 
            product={product} 
            onAddToCart={onAddToCart} 
            onSelectProduct={onSelectProduct} 
            showToast={showToast}
          />
        </div>
      ))}
    </div>
  );
}

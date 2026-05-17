import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import styles from './ProductCard.module.css';

const LEAF_COLORS = ['#7acc5f', '#8dd96a', '#6abb52', '#93d96f', '#5fb848'];

function ProductImage({ id, src, name }) {
  const [imgError, setImgError] = useState(false);

  const hash = typeof id === 'string'
    ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : (id || 0);
  const color = LEAF_COLORS[hash % LEAF_COLORS.length];

  if (src && !imgError) {
    return (
      <div className={styles.imagePlaceholder}>
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <div className={styles.imagePlaceholder} style={{ background: `linear-gradient(135deg, ${color}dd, ${color}99)` }}>
      <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
        <path d="M32 8C20 8 10 20 10 34c0 10 7 18 16 20v-8c-5-2-9-7-9-12 0-9 7-16 15-16 8 0 15 7 15 16 0 5-4 10-9 12v8c9-2 16-10 16-20 0-14-10-26-22-26z" fill="white" fillOpacity="0.6"/>
        <path d="M30 56V32M30 32C26 28 20 28 18 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.7"/>
      </svg>
    </div>
  );
}

export default function ProductCard({ product, onSelectProduct, onRequestDelete, isAdmin, showToast }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    showToast?.(`Successfully added to cart`);
  };

  const handleRequestDelete = (e) => {
    e.stopPropagation();
    onRequestDelete?.(product);
  };

  return (
    <article className={styles.card} onClick={() => onSelectProduct?.(product)}>
      {product.promoted && (
        <div className={styles.promotedBadge}>
          <span className={styles.promotedIcon}>⭐</span>
        </div>
      )}
      
      {/* Admin Action: Trash overlay button */}
      {isAdmin && (
        <button className={styles.adminDeleteBtn} onClick={handleRequestDelete} title="Delete Product">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      )}

      <ProductImage
        id={product.id}
        src={product.image || product.image_url || product.photo || product.thumbnail}
        name={product.name}
      />

      <div className={styles.body}>
        <div className={styles.info}>
          <h3 className={styles.name}>{product.name}</h3>

          <p className={styles.location}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {product.region || "CENTRAL LUZON"}
          </p>
        </div>

        <div className={styles.footer}>
          <div className={styles.priceContainer}>
            <span className={styles.price}>₱{product.price}</span>
            <span className={styles.unit}>/{product.unit}</span>
          </div>

          <button className={styles.cartBtn} onClick={handleAddToCart} title="Add to Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
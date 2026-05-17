import React, { useState } from 'react';
import styles from './ProductDetailModal.module.css';

const LEAF_COLORS = [
  '#7acc5f', '#8dd96a', '#6abb52', '#93d96f', '#5fb848',
];

function ProductImage({ src, id, name }) {
  const defaultImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80";
  const [imgSrc, setImgSrc] = useState(src);
  if (imgSrc) {
    return (
      <img 
        src={imgSrc} 
        alt={name} 
        className={styles.productImg}
        onError={() => {
          //if no image, use the fall back
          setImgSrc(defaultImage);
        }}
      />
    );
  }
  return (
    <div className={styles.imagePlaceholder} style={{ background: `linear-gradient(135deg, ${color}dd, ${color}99)`, borderColor: '#92ce49' }}>
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 8C20 8 10 20 10 34c0 10 7 18 16 20v-8c-5-2-9-7-9-12 0-9 7-16 15-16 8 0 15 7 15 16 0 5-4 10-9 12v8c9-2 16-10 16-20 0-14-10-26-22-26z" fill="white" fillOpacity="0.6"/>
        <path d="M30 56V32M30 32C26 28 20 28 18 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.7"/>
      </svg>
    </div>
  );
}

export default function ProductDetailModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
    onClose(); 
  };

  const handleIncrement = () => {
    const stock = product.stock || 100;
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} title="Close">
          ✕
        </button>
        
        <div className={styles.content}>
          <div className={styles.imageSection}>
            <ProductImage src={product.image} id={product._id || product.id} name={product.name} />
          </div>
          
          <div className={styles.infoSection}>
            <h2 className={styles.title}>{product.name}</h2>
            
            <div className={styles.price}>
              <span className={styles.amount}>₱{product.price}/{product.unit}</span>
            </div>

            <p className={styles.region}>{product.region}</p>
            
            <p className={styles.description}>
              {product.description || 'A fresh and quality product from the farm.'}
            </p>

            <p className={styles.stock}>{product.stock || 192} in stock</p>

            <div className={styles.actionRow}>
              <div className={styles.quantitySection}>
                <button 
                  className={styles.quantityBtn} 
                  onClick={handleDecrement} 
                  aria-label="Decrease quantity"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                
                <div className={styles.quantityDisplay}>{quantity}</div>
                
                <button 
                  className={styles.quantityBtn} 
                  onClick={handleIncrement} 
                  aria-label="Increase quantity"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>

              <button className={styles.addBtn} onClick={handleAddToCart}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
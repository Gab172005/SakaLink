import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { ordersAPI } from '../../services/api';
import styles from './CartModal.module.css';

export default function CartModal({ isOpen, onClose, showToast }) {
  const { cart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
  const [step, setStep] = useState('cart'); // 'cart' or 'checkout'
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!address) {
      showToast('Please provide an address');
      return;
    }

    setIsSubmitting(true);
    try {
      // Since backend currently only supports single product orders,
      // we loop through cart items and create an order for each.
      const orderPromises = cart.map(item => 
        ordersAPI.create({
          productId: item._id || item.id,
          orderQuantity: item.quantity,
          address, 
          paymentMethod
        })
      );

      await Promise.all(orderPromises);
      
      showToast('Order placed successfully! 🎉');
      clearCart();
      setStep('cart');
      onClose();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCartItems = () => (
    <>
      <h2 className={styles.title}>Your Cart</h2>
      {cart.length === 0 ? (
        <div className={styles.emptyCart}>Your cart is empty</div>
      ) : (
        <div className={styles.cartList}>
          {cart.map((item) => (
            <div key={item._id || item.id} className={styles.cartItem}>
              <div className={styles.itemImage}>🌿</div>
              <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <span className={styles.itemPrice}>₱{item.price} / {item.unit || 'unit'}</span>
              </div>
              <div className={styles.itemTotal}>
                <span className={styles.itemTotalPrice}>₱{item.price * item.quantity}</span>
              </div>
              <div className={styles.quantityControls}>
                <button 
                  className={styles.qtyBtn}
                  onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                >
                  -
                </button>
                <span className={styles.qtyValue}>{item.quantity}</span>
                <button 
                  className={styles.qtyBtn}
                  onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <button 
                className={styles.removeBtn}
                onClick={() => removeFromCart(item._id || item.id)}
                title="Remove"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.footer}>
        <div className={styles.totalRow}>
          <span>Total</span>
          <span>₱{totalAmount}</span>
        </div>
        <button 
          className={styles.checkoutBtn}
          disabled={cart.length === 0}
          onClick={() => setStep('checkout')}
        >
          Proceed to Checkout
        </button>
      </div>
    </>
  );

  const renderCheckoutForm = () => (
    <>
      <button className={styles.backBtn} onClick={() => setStep('cart')}>
        ← Back to Cart
      </button>
      <h2 className={styles.title}>Checkout</h2>
      <form onSubmit={handleCheckout}>
        <div className={styles.formGroup}>
          <label>Delivery Address</label>
          <input 
            type="text" 
            placeholder="Enter your full address" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Payment Method</label>
          <select 
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="Cash on Delivery">Cash on Delivery</option>
            <option value="GCash">GCash</option>
            <option value="Maya">Maya</option>
          </select>
        </div>
        
        <div className={styles.footer}>
          <div className={styles.totalRow}>
            <span>Total to Pay</span>
            <span>₱{totalAmount}</span>
          </div>
          <button 
            type="submit" 
            className={styles.checkoutBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.active : ''}`} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        {step === 'cart' ? renderCartItems() : renderCheckoutForm()}
      </div>
    </div>
  );
}

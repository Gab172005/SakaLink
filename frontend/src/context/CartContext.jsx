import { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { authAPI } from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const syncTimerRef = useRef(null);

  // Load cart from backend on login
  useEffect(() => {
    if (isAuthenticated) {
      const fetchCart = async () => {
        try {
          const backendCart = await authAPI.getCart();
          // backendCart is an array of { product: { ... }, quantity: N }
          const formattedCart = backendCart
            .filter(item => item.product) // Filter out deleted products
            .map(item => ({
              ...item.product,
              quantity: item.quantity
            }));
          setCart(formattedCart);
          setIsLoaded(true);
        } catch (error) {
          console.error("Failed to fetch cart:", error);
          setIsLoaded(true); // set loaded anyway to allow local cart to work
        }
      };
      fetchCart();
    } else {
      setCart([]);
      setIsLoaded(false);
    }
  }, [isAuthenticated]);

  // Sync cart to backend on changes
  useEffect(() => {
    if (!isAuthenticated || !isLoaded) return;

    // Debounce sync to avoid too many requests
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

    syncTimerRef.current = setTimeout(async () => {
      try {
        const cartToSync = cart.map(item => ({
          productId: item._id || item.id,
          quantity: item.quantity
        }));
        await authAPI.syncCart(cartToSync);
      } catch (error) {
        console.error("Failed to sync cart:", error);
      }
    }, 1000);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [cart, isAuthenticated, isLoaded]);

  const getProductId = (item) => item._id || item.id;
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => getProductId(item) === getProductId(product));
      if (existingItem) {
        return prevCart.map((item) =>
          getProductId(item) === getProductId(product)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => getProductId(item) !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        getProductId(item) === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const totalAmount = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    totalAmount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

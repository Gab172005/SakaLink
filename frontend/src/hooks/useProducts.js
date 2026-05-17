// src/hooks/useProducts.js
import { useState, useEffect } from "react";
import { productsAPI } from "../services/api";
import { PRODUCTS as FALLBACK_PRODUCTS } from "../data/products";

export function useProducts(params = { sortBy: "name", order: "asc" }) { // Use "name" instead of "productName"
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await productsAPI.getAll(params);
        if (!cancelled) {
          setProducts(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Products API unavailable, using fallback data.", err.message);
          setProducts(FALLBACK_PRODUCTS);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [JSON.stringify(params)]); 
  
  return { products, loading, error };
}
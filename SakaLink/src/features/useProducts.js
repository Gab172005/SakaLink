// src/hooks/useProducts.js
// Fetches products from the backend. Falls back to static data if the
// server is unreachable (useful during local frontend-only dev).

import { useState, useEffect } from "react";
import { productsAPI } from "../services/api";

const FALLBACK_PRODUCTS = [
  { productName: "Organic Lettuce", productDescription: "Benguet Highlands", price: 85, productType: 1 },
  { productName: "Roma Tomatoes",   productDescription: "Nueva Ecija",        price: 60, productType: 1 },
  { productName: "Sweet Corn",      productDescription: "Bukidnon",           price: 35, productType: 1 },
  { productName: "Free-range Eggs", productDescription: "Batangas",           price: 12, productType: 2 },
  { productName: "Native Chicken",  productDescription: "Laguna",             price: 280, productType: 2 },
  { productName: "Purple Eggplant", productDescription: "Ilocos Norte",       price: 45, productType: 1 },
];

export function useProducts(params = { sortBy: "productName", order: "asc" }) {
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
          if (Array.isArray(data) && data.length > 2) {
            setProducts(data);
          } else {
            console.warn("Less than 3 products found in database, using fallback.");
            setProducts(FALLBACK_PRODUCTS);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { products, loading, error };
}
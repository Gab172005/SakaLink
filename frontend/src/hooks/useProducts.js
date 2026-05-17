// src/hooks/useProducts.js
import { useState, useEffect } from "react";
import { productsAPI } from "../services/api";

// ✅ UPDATED: Keys match your mongoose schema perfectly now!
const FALLBACK_PRODUCTS = [
  { name: "Organic Lettuce", description: "Benguet Highlands", price: 85, type: 1, certifications: ["PhilGAP Certified"], region: "CAR / Cordillera Administrative Region", promoted: false },
  { name: "Roma Tomatoes",   description: "Nueva Ecija",       price: 60, type: 1, certifications: ["Direct Trade"], region: "Region III / Central Luzon", promoted: false },
  { name: "Sweet Corn",      description: "Bukidnon",          price: 35, type: 1, certifications: [], region: "Region X / Northern Mindanao", promoted: false },
  { name: "Free-range Eggs", description: "Batangas",          price: 12, type: 6, certifications: ["NMIS Approved"], region: "Region IV-A / CALABARZON", promoted: false },
  { name: "Native Chicken",  description: "Laguna",            price: 280, type: 2, certifications: ["NMIS Approved"], region: "Region IV-A / CALABARZON", promoted: true },
  { name: "Purple Eggplant", description: "Ilocos Norte",      price: 45, type: 1, certifications: [], region: "Region I / Ilocos Region", promoted: false },
];

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
          // If api returns an array, use it. Otherwise, use fallback.
          setProducts(Array.isArray(data) ? data : FALLBACK_PRODUCTS);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]); // 💡 Tip: re-run hook if sorting params change!
  
  return { products, loading, error };
}
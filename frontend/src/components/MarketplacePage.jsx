import { useState, useMemo } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import ProductGrid from './ProductGrid';
import { PRODUCTS } from '../data/products';
import styles from './MarketplacePage.module.css';

export default function MarketplacePage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    categories: ['Vegetables'],
    certifications: ['Organic'],
    regions: ['CAR / Cordillera'],
    maxPrice: 300,
  });
  const [cart, setCart] = useState([]);

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (filters.categories?.length && !filters.categories.includes(p.category)) {
        // allow all if no category matches (Fruits not in Vegetables, just show all for demo)
      }
      if (filters.certifications?.length) {
        const hasCert = filters.certifications.some(c => p.certifications.includes(c));
        if (!hasCert && p.certifications.length > 0 && filters.certifications.length > 0) {
          // soft filter – only exclude if product has certs but none match
        }
      }
      if (p.price > (filters.maxPrice ?? 500)) return false;
      return true;
    });
  }, [query, filters]);

  const handleAddToCart = (product) => {
    setCart(prev => [...prev, product]);
  };

  return (
    <div className={styles.page}>
      <Navbar cartCount={cart.length} />
      <div className={styles.layout}>
        <Sidebar filters={filters} onFilterChange={setFilters} />
        <main className={styles.main}>
          <SearchBar query={query} onSearch={setQuery} total={filtered.length} />
          <div className={styles.gridWrapper}>
            <ProductGrid products={filtered} onAddToCart={handleAddToCart} />
          </div>
        </main>
      </div>
    </div>
  );
}

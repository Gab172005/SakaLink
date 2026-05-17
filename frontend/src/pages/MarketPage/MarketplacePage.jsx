import { useState, useMemo } from 'react';
import Sidebar from '../../components/MarketPage/Sidebar';
import SearchBar from '../../components/MarketPage/SearchBar';
import ProductGrid from '../../components/MarketPage/ProductGrid';
import ProductDetailModal from '../../components/MarketPage/ProductDetailModal';
import { useProducts } from '../../hooks/useProducts';
import styles from './MarketplacePage.module.css';

export default function MarketplacePage({ addToCart }) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [filters, setFilters] = useState({
    categories: [],
    certifications: [],
    regions: [],
    ratings: [],
    units: [],
    sellerTypes: [],
    maxPrice: 500,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { products, loading, error } = useProducts();

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (p.price > (filters.maxPrice ?? 500)) return false;
      return true;
    });

    switch (sortBy) {
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      default: break;
    }

    return result;
  }, [query, filters.maxPrice, sortBy, products]);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <Sidebar filters={filters} onFilterChange={setFilters} />
        <main className={styles.main}>
          <SearchBar
            query={query}
            onSearch={setQuery}
            total={filtered.length}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filters={filters}
            onFilterChange={setFilters}
          />
          <div className={styles.gridWrapper}>
            {loading && <p className={styles.loadingMessage}>Loading products...</p>}
            {error && <p className={styles.errorMessage}>Failed to load products.</p>}
            {!loading && !error && (
              <ProductGrid
                products={filtered}
                onAddToCart={handleAddToCart}
                onSelectProduct={setSelectedProduct}
              />
            )}
          </div>
        </main>
      </div>
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
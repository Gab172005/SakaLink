import { useState, useMemo } from 'react';
import Sidebar from '../../components/MarketPage/Sidebar';
import SearchBar from '../../components/MarketPage/SearchBar';
import ProductGrid from '../../components/MarketPage/ProductGrid';
import ProductDetailModal from '../../components/MarketPage/ProductDetailModal';
import { PRODUCTS } from '../../data/products';
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

  const filtered = useMemo(() => {
    let result = PRODUCTS.filter(p => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (filters.categories?.length && !filters.categories.includes(p.category)) return false;
      if (filters.certifications?.length && !filters.certifications.some(c => p.certifications.includes(c))) return false;
      if (p.price > (filters.maxPrice ?? 500)) return false;
      if (filters.ratings?.length && !filters.ratings.includes(p.rating)) return false;
      if (filters.units?.length && !filters.units.includes(p.unit)) return false;
      if (filters.sellerTypes?.length && !filters.sellerTypes.includes(p.seller)) return false;
      return true;
    });

    // Apply sorting
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'location':
        result.sort((a, b) => a.location.localeCompare(b.location));
        break;
      default:
        break;
    }

    return result;
  }, [query, filters, sortBy]);

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
            <ProductGrid 
              products={filtered} 
              onAddToCart={handleAddToCart} 
              onSelectProduct={setSelectedProduct} 
            />
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

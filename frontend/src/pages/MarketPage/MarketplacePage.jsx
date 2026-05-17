import { useState, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import Sidebar from '../../components/MarketPage/Sidebar';
import SearchBar from '../../components/MarketPage/SearchBar';
import ProductGrid from '../../components/MarketPage/ProductGrid';
import ProductDetailModal from '../../components/MarketPage/ProductDetailModal';
import { useProducts } from '../../hooks/useProducts';
import styles from './MarketplacePage.module.css';

const TYPE_MAP = {
  1: 'Vegetables',
  2: 'Poultry & Meat',
  3: 'Fruits',
  4: 'Grains & Rice',
  5: 'Seafood',
  6: 'Dairy & Eggs'
};

export default function MarketplacePage({ showToast }) {
  const { addToCart } = useCart();
  const { products: rawProducts, loading } = useProducts();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [filters, setFilters] = useState({
    categories: [],
    certifications: [],
    regions: [],
    ratings: [],
    units: [],
    sellerTypes: [],
    maxPrice: 500, // Increased default for real products
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Map backend data to frontend structure
  const products = useMemo(() => {
    return rawProducts.map(p => ({
      ...p,
      id: p.id || p._id,
      category: p.category || TYPE_MAP[p.type] || 'Other',
      rating: p.rating || 5,
      seller: p.seller || 'Local Farmer',
      location: p.location || p.region,
      stock: p.stock ?? p.quantity ?? 0,
      unit: p.unit || 'kg'
    }));
  }, [rawProducts]);

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (filters.categories?.length && !filters.categories.includes(p.category)) return false;
      if (filters.certifications?.length && !filters.certifications.some(c => (p.certifications || []).includes(c))) return false;
      if (filters.regions?.length && !filters.regions.includes(p.location)) return false;
      if (p.price > (filters.maxPrice ?? 1000)) return false;
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
        result.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
        break;
      default:
        break;
    }

    return result;
  }, [products, query, filters, sortBy]);

  const handleAddToCart = (product, quantity = 1) => {
    addToCart(product, quantity);
    showToast(`Added ${product.name} to cart! 🛒`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <Sidebar filters={filters} onFilterChange={setFilters} products={products} />
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
            {loading ? (
              <div className={styles.loadingState}>
                <span className={styles.spinner} />
                <p>Loading market products...</p>
              </div>
            ) : (
              <ProductGrid 
                products={filtered} 
                onAddToCart={handleAddToCart} 
                onSelectProduct={setSelectedProduct} 
                showToast={showToast}
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

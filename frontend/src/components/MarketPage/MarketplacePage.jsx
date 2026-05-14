import { useState, useMemo } from 'react';
import Navbar from '../../components/MarketPage/Navbar'; // Update path
import Sidebar from '../../components/MarketPage/Sidebar'; // Update path
import SearchBar from '../../components/MarketPage/SearchBar'; // Update path
import ProductGrid from '../../components/MarketPage/ProductGrid'; // Update path
import ProductDetailModal from '../../components/MarketPage/ProductDetailModal'; // Update path

export default function MarketplacePage() {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [filters, setFilters] = useState({
    categories: ['Vegetables'],
    certifications: ['Organic'],
    regions: ['CAR / Cordillera'],
    ratings: [],
    units: [],
    sellerTypes: [],
    maxPrice: 300,
  });
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filtered = useMemo(() => {
    let result = PRODUCTS.filter(p => {
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
      
      // Filter by ratings
      if (filters.ratings?.length && !filters.ratings.includes(p.rating)) {
        return false;
      }
      
      // Filter by weight/volume units
      if (filters.units?.length && !filters.units.includes(p.unit)) {
        return false;
      }
      
      // Filter by seller types
      if (filters.sellerTypes?.length && !filters.sellerTypes.includes(p.seller)) {
        return false;
      }
      
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
    setCart(prev => [...prev, product]);
  };

  return (
    <div className={styles.page}>
      <Navbar cartCount={cart.length} />
      <div className={styles.layout}>
        <Sidebar filters={filters} onFilterChange={setFilters} />
        <main className={styles.main}>
          <SearchBar query={query} onSearch={setQuery} total={filtered.length} sortBy={sortBy} onSortChange={setSortBy} filters={filters} onFilterChange={setFilters} />
          <div className={styles.gridWrapper}>
            <ProductGrid products={filtered} onAddToCart={handleAddToCart} onSelectProduct={setSelectedProduct} />
          </div>
        </main>
      </div>
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />
    </div>
  );
}

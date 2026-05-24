import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Sidebar from '../../components/MarketPage/Sidebar';
import SearchBar from '../../components/MarketPage/SearchBar';
import ProductGrid from '../../components/MarketPage/ProductGrid';
import ProductDetailModal from '../../components/MarketPage/ProductDetailModal';
import AddProductModal from '../../components/MarketPage/AddProductModal';
import EditProductModal from '../../components/MarketPage/EditProductModal';
import DeleteProductModal from '../../components/MarketPage/DeleteProductModal';
import { adminAPI } from '../../services/api';
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
  const { userType, user } = useAuth();
  const { addToCart } = useCart();
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { products: rawProducts, loading } = useProducts({ sortBy: 'name', order: 'asc', refreshKey });
  const isAdmin = userType === 'admin' || user?.userType === 'admin';
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [filters, setFilters] = useState({
    categories: [],
    certifications: [],
    regions: [],
    ratings: [],
    units: [],
    sellerTypes: [],
    maxPrice: 1000,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Map backend data to SakaLink structure
  const products = useMemo(() => {
    return rawProducts.map(p => ({
      ...p,
      id: p.id || p._id,
      category: p.category || TYPE_MAP[p.type] || 'Other',
      rating: p.rating || 5,
      seller: p.seller || 'Local Farmer',
      location: p.location || p.region,
      region: p.region || p.location,   // ← add this line
      stock: p.stock ?? p.quantity ?? 0,
      unit: p.unit || 'kg'
    }));
  }, [rawProducts]);

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (filters.categories?.length && !filters.categories.includes(p.category)) return false;
      if (filters.certifications?.length && !filters.certifications.every(c => (p.certifications || []).includes(c))) return false;
      if (filters.regions?.length && !filters.regions.includes(p.region)) return false;
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

  const handleDeleteProduct = async (id) => {
    try {
      setIsDeleting(true);
      await adminAPI.deleteProduct(id);
      showToast("Product removed successfully.");
      setRefreshKey((current) => current + 1);
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRequestDelete = (product) => setDeleteTarget(product);
  const handleCancelDelete = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
  };

  const handleProductUpdated = () => {
    setRefreshKey((current) => current + 1);
    setSelectedProduct(null);
  };

  // Separate promoted and regular products
  const promotedProducts = useMemo(() => {
    return filtered.filter(p => p.promoted);
  }, [filtered]);

  const regularProducts = useMemo(() => {
    return filtered.filter(p => !p.promoted);
  }, [filtered]);

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <Sidebar filters={filters} onFilterChange={setFilters} products={products} />
        <main className={styles.main}>
            <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Marketplace</h1>
              <p className={styles.pageIntro}>Browse the freshest goods that our local farmers have to offer!</p>
            </div>
            {isAdmin && (
              <button className={styles.adminAddBtn} onClick={() => setShowAddModal(true)}>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={styles.adminBtnIcon}
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Add Product</span>
              </button>
            )}
          </div>

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
              <>
                {promotedProducts.length > 0 && (
                  <div className={styles.promotedSection}>
                    <h2 className={styles.promotedTitle}>
                      <span className={styles.promotedIcon}>⭐</span>
                      Support Disaster-Struck Farmers
                    </h2>
                    <p className={styles.promotedDesc}>
                      Featured products from regions in need of our support
                    </p>
                    <ProductGrid 
                      products={promotedProducts} 
                      onAddToCart={handleAddToCart} 
                      onSelectProduct={setSelectedProduct} 
                      onRequestDelete={handleRequestDelete}
                      isAdmin={isAdmin}
                      showToast={showToast}
                      isPromoted={true}
                    />
                  </div>
                )}
                {regularProducts.length > 0 && (
                  <div className={styles.regularSection}>
                    {promotedProducts.length > 0 && (
                      <h3 className={styles.regularTitle}>All Products</h3>
                    )}
                    <ProductGrid 
                      products={regularProducts} 
                      onAddToCart={handleAddToCart} 
                      onSelectProduct={setSelectedProduct} 
                      onRequestDelete={handleRequestDelete}
                      isAdmin={isAdmin}
                      showToast={showToast}
                      isPromoted={false}
                    />
                  </div>
                )}
                {promotedProducts.length === 0 && regularProducts.length === 0 && (
                  <div className={styles.emptyState}>
                    <p>No products found matching your filters</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      {showAddModal && (
        <AddProductModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onCreated={() => setRefreshKey((current) => current + 1)}
          showToast={showToast}
        />
      )}

      <DeleteProductModal
        open={Boolean(deleteTarget)}
        product={deleteTarget}
        onConfirm={handleDeleteProduct}
        onCancel={handleCancelDelete}
        loading={isDeleting}
      />

      {selectedProduct && isAdmin ? (
        <EditProductModal
          open={Boolean(selectedProduct)}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdated={handleProductUpdated}
          showToast={showToast}
        />
      ) : selectedProduct ? (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      ) : null}
    </div>
  );
}

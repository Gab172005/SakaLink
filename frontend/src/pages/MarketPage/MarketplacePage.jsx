import React, { useState, useMemo } from "react";
import Navbar from "../../components/MarketPage/Navbar.jsx";
import Sidebar from "../../components/MarketPage/Sidebar.jsx";
import SearchBar from "../../components/MarketPage/SearchBar.jsx";
import ProductGrid from "../../components/MarketPage/ProductGrid.jsx";
import { PRODUCTS, SORT_OPTIONS } from "../../data/products.js";
import "./MarketplacePage.css";
import ProductDetailModal from "../../components/MarketPage/ProductDetailModal.jsx";
function toggleSet(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function MarketplacePage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [query, setQuery] = useState(""); 
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [activeSort, setActiveSort] = useState("popular");

  const filtered = useMemo(() => {
    let result = PRODUCTS.filter((p) => {
      const matchesQuery =
        !query || p.name.toLowerCase().includes(query.toLowerCase());
      const matchesPrice =
        p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesCert =
        selectedCertifications.length === 0 ||
        selectedCertifications.some((c) => p.certifications.includes(c));
      return matchesQuery && matchesPrice && matchesCert;
    });

    if (activeSort === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    else if (activeSort === "price-desc") result = [...result].sort((a, b) => b.price - a.price);

    return result;
  }, [query, priceRange, selectedCertifications, activeSort]);

  return (
    <div className="marketplace-root">
      <Navbar />
      <div className="marketplace-layout">
        <Sidebar
          filters={{
            categories: selectedCategories,
            maxPrice: priceRange[1],
            certifications: selectedCertifications,
            regions: selectedRegions,
          }}
          onFilterChange={(newFilters) => {
            if (newFilters.categories) setSelectedCategories(newFilters.categories);
            if (newFilters.maxPrice !== undefined) setPriceRange([0, newFilters.maxPrice]);
            if (newFilters.certifications) setSelectedCertifications(newFilters.certifications);
            if (newFilters.regions) setSelectedRegions(newFilters.regions);
          }}
        />
        <main className="marketplace-main">
          <SearchBar
              query={query}
              onSearch={setQuery} // Use setQuery here to update the list
              total={filtered.length}
              sortBy={activeSort}
              onSortChange={setActiveSort}
              filters={{
                ratings: [],      // Or your actual ratings state
                units: [],        // Or your actual units state
                sellerTypes: []   // Or your actual sellerTypes state
              }}
              onFilterChange={() => {}} // Placeholder for now
            />
          <div className="marketplace-grid-area">
            <ProductGrid 
              products={filtered} 
              onSelectProduct={setSelectedProduct} // This was missing!
            />
          </div>
        </main>
      </div>
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={(product) => {
            console.log("Added to cart:", product.name);
            // Your cart logic here
          }}
        />
      )}
    </div>
  );
}

import React, { useState, useMemo } from "react";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import SearchBar from "./components/SearchBar.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import { PRODUCTS, SORT_OPTIONS } from "./data/products.js";
import "./MarketplacePage.css";

function toggleSet(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function MarketplacePage() {
  const [query, setQuery] = useState("Mangga");
  const [selectedCategories, setSelectedCategories] = useState(["vegetables"]);
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [selectedCertifications, setSelectedCertifications] = useState(["organic"]);
  const [selectedRegions, setSelectedRegions] = useState(["car"]);
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
          selectedCategories={selectedCategories}
          onCategoryChange={(id) => setSelectedCategories(toggleSet(selectedCategories, id))}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          selectedCertifications={selectedCertifications}
          onCertificationChange={(id) => setSelectedCertifications(toggleSet(selectedCertifications, id))}
          selectedRegions={selectedRegions}
          onRegionChange={(id) => setSelectedRegions(toggleSet(selectedRegions, id))}
        />
        <main className="marketplace-main">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            resultCount={filtered.length}
            activeSort={activeSort}
            onSortChange={setActiveSort}
            SORT_OPTIONS={SORT_OPTIONS}
          />
          <div className="marketplace-grid-area">
            <ProductGrid products={filtered} />
          </div>
        </main>
      </div>
    </div>
  );
}

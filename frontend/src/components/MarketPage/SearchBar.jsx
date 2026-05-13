import { useState, useRef } from 'react';
import styles from './SearchBar.module.css';
import FilterDropdown from './FilterDropdown';

export default function SearchBar({ query, onSearch, total, sortBy, onSortChange, filters, onFilterChange }) {
  const [value, setValue] = useState(query);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterBtnRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue); 
    onSearch(newValue); 
  };

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'location', label: 'Location' },
  ];

  const activeFilterCount = (filters.ratings?.length || 0) + (filters.units?.length || 0) + (filters.sellerTypes?.length || 0);

  return (
    <div className={styles.wrapper}>
      <div className={styles.resultInfo}>
        Showing <strong>{total}</strong> results for <strong>"{query}"</strong>
      </div>
      <div className={styles.controls}>
        <form className={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          className={styles.input}
          placeholder="Search products..."
          value={value}
          onChange={handleChange} // Triggered on every keystroke
        />
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </form>
        <div style={{ position: 'relative' }}>
          <button 
            ref={filterBtnRef}
            className={`${styles.filterBtn} ${filterOpen ? styles.active : ''}`}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            Filter
            {activeFilterCount > 0 && <span className={styles.badge}>{activeFilterCount}</span>}
          </button>
          <FilterDropdown 
            filters={filters} 
            onFilterChange={onFilterChange} 
            isOpen={filterOpen} 
            onClose={() => setFilterOpen(false)} 
          />
        </div>
        <select 
          className={styles.sortBtn} 
          value={sortBy} 
          onChange={(e) => onSortChange(e.target.value)}
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

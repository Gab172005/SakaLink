import styles from './SortBar.module.css';

export default function SortBar({ sortBy, onSortChange }) {
  return (
    <div className={styles.sortBar}>
      <label htmlFor="sort-select" className={styles.label}>Sort by:</label>
      <select
        id="sort-select"
        className={styles.select}
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="price-asc">Price (Low to High)</option>
        <option value="price-desc">Price (High to Low)</option>
        <option value="location">Location</option>
      </select>
    </div>
  );
}

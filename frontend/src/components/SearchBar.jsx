import { useState } from 'react';
import styles from './SearchBar.module.css';

export default function SearchBar({ query, onSearch, total }) {
  const [value, setValue] = useState(query);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.resultInfo}>
        Showing <strong>{total}</strong> results for <strong>"{query}"</strong>
      </div>
      <div className={styles.controls}>
        <form className={styles.searchForm} onSubmit={handleSubmit}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className={styles.input}
            placeholder="Search products..."
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </form>
        <button className={styles.filterBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filter
        </button>
        <button className={styles.sortBtn}>
          Sort: Most Popular
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

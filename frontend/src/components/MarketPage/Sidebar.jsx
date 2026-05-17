import { useState } from 'react';
import styles from './Sidebar.module.css';
import { CATEGORIES, CERTIFICATIONS, REGIONS, PRODUCTS } from '../../data/products';

export default function Sidebar({ filters, onFilterChange, products = PRODUCTS }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggle = (group, value) => {
    const current = filters[group] || [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [group]: next });
  };

  const handlePriceChange = (e) => {
    onFilterChange({ ...filters, maxPrice: Number(e.target.value) });
  };

  const categoryCounts = products.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {});

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <button 
        className={styles.toggleBtn} 
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <div className={styles.hamburger}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      <div className={styles.sidebarContent}>
        <FilterSection title="CATEGORIES">
          {CATEGORIES.map(cat => (
            <label key={cat.name} className={styles.checkLabel}>
              <div className={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={(filters.categories || []).includes(cat.name)}
                  onChange={() => toggle('categories', cat.name)}
                />
                <span className={styles.customCheckbox}></span>
              </div>
              <span className={styles.checkText}>{cat.name}</span>
              <span className={styles.count}>{categoryCounts[cat.name] ?? 0}</span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="PRICE RANGE">
          <div className={styles.priceTrack}>
            <input
              type="range"
              min={0}
              max={500}
              value={filters.maxPrice ?? 500}
              onChange={handlePriceChange}
              className={styles.rangeInput}
              style={{
                background: `linear-gradient(to right, var(--green-600) 0%, var(--green-600) ${((filters.maxPrice ?? 500) / 500) * 100}%, var(--border) ${((filters.maxPrice ?? 500) / 500) * 100}%, var(--border) 100%)`
              }}
            />
            <div className={styles.priceLabels}>
              <span>₱0</span>
              <span>₱{filters.maxPrice ?? 500}</span>
              <span>₱500</span>
            </div>
          </div>
        </FilterSection>

        <FilterSection title="CERTIFICATIONS">
          {CERTIFICATIONS.map(cert => (
            <label key={cert} className={styles.checkLabel}>
              <div className={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={(filters.certifications || []).includes(cert)}
                  onChange={() => toggle('certifications', cert)}
                />
                <span className={styles.customCheckbox}></span>
              </div>
              <span className={styles.checkText}>{cert}</span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="REGION">
          {REGIONS.map(region => (
            <label key={region} className={styles.checkLabel}>
              <div className={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={(filters.regions || []).includes(region)}
                  onChange={() => toggle('regions', region)}
                />
                <span className={styles.customCheckbox}></span>
              </div>
              <span className={styles.checkText}>{region}</span>
            </label>
          ))}
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.sectionContent}>{children}</div>
    </div>
  );
}

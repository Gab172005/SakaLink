import styles from './Sidebar.module.css';
import { CATEGORIES, CERTIFICATIONS, REGIONS } from '../data/products';

export default function Sidebar({ filters, onFilterChange }) {
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

  return (
    <aside className={styles.sidebar}>
      <FilterSection title="CATEGORIES">
        {CATEGORIES.map(cat => (
          <label key={cat.name} className={styles.checkLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={(filters.categories || []).includes(cat.name)}
              onChange={() => toggle('categories', cat.name)}
            />
            <span className={styles.checkText}>{cat.name}</span>
            <span className={styles.count}>{cat.count}</span>
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
          />
          <div className={styles.priceLabels}>
            <span>₱0</span>
            <span>₱{filters.maxPrice ?? 300}</span>
            <span>₱500</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="CERTIFICATIONS">
        {CERTIFICATIONS.map(cert => (
          <label key={cert} className={styles.checkLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={(filters.certifications || []).includes(cert)}
              onChange={() => toggle('certifications', cert)}
            />
            <span className={styles.checkText}>{cert}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="REGION">
        {REGIONS.map(region => (
          <label key={region} className={styles.checkLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={(filters.regions || []).includes(region)}
              onChange={() => toggle('regions', region)}
            />
            <span className={styles.checkText}>{region}</span>
          </label>
        ))}
      </FilterSection>
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

import styles from './FilterDropdown.module.css';
import { RATINGS, UNITS, SELLER_TYPES } from '../../data/products';

export default function FilterDropdown({ filters, onFilterChange, isOpen, onClose }) {
  const toggle = (group, value) => {
    const current = filters[group] || [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [group]: next });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.dropdown}>
        <div className={styles.header}>
          <h3 className={styles.title}>Quick Filters</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          <FilterGroup title="RATINGS">
            {RATINGS.map(rating => (
              <label key={rating} className={styles.checkLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={(filters.ratings || []).includes(rating)}
                  onChange={() => toggle('ratings', rating)}
                />
                <span className={styles.checkText}>
                  {'★'.repeat(rating)}{'☆'.repeat(5-rating)} {rating}-Star
                </span>
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="WEIGHT/VOLUME UNITS">
            {UNITS.map(unit => (
              <label key={unit} className={styles.checkLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={(filters.units || []).includes(unit)}
                  onChange={() => toggle('units', unit)}
                />
                <span className={styles.checkText}>Per {unit}</span>
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="SELLER TYPE">
            {SELLER_TYPES.map(seller => (
              <label key={seller} className={styles.checkLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={(filters.sellerTypes || []).includes(seller)}
                  onChange={() => toggle('sellerTypes', seller)}
                />
                <span className={styles.checkText}>{seller}</span>
              </label>
            ))}
          </FilterGroup>
        </div>

        <div className={styles.footer}>
          <button className={styles.clearBtn} onClick={() => {
            onFilterChange({
              ...filters,
              ratings: [],
              units: [],
              sellerTypes: [],
            });
          }}>
            Clear Filters
          </button>
          <button className={styles.applyBtn} onClick={onClose}>
            Apply
          </button>
        </div>
      </div>
    </>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className={styles.group}>
      <h4 className={styles.groupTitle}>{title}</h4>
      <div className={styles.groupContent}>{children}</div>
    </div>
  );
}

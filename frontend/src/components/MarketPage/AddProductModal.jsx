import { useEffect, useState } from "react";
import { adminAPI } from "../../services/api";
import styles from "./AddProductModal.module.css";

const PRODUCT_TYPES = [
  { value: 1, label: "Vegetables" },
  { value: 2, label: "Poultry & Meat" },
  { value: 3, label: "Fruits" },
  { value: 4, label: "Grains & Rice" },
  { value: 5, label: "Seafood" },
  { value: 6, label: "Dairy & Eggs" },
];

const REGION_OPTIONS = [
  "NCR / Metro Manila",
  "CAR / Cordillera",
  "Region I / Ilocos",
  "Region II / Cagayan Valley",
  "Region III / Central Luzon",
  "Region IV-A / CALABARZON",
  "REGION IV-B / MIMAROPA",
  "Region V / Bicol",
  "Region VI / Western Visayas",
  "Region VII / Central Visayas",
  "Region VIII / Eastern Visayas",
  "Region IX / Zamboanga",
  "Region X / Northern Mindanao",
  "Region XI / Davao",
  "Region XII / SOCCSKSARGEN",
  "Region XIII / Caraga",
  "BARMM / Bangsamoro",
];

const CERTIFICATION_DETAILS = {//add this to the sidebar later
  "PhilGAP Certified": "Philippine Good Agricultural Practices. Ensures safe production, crop management, and minimal environmental impact.",
  "Organic / PhilOA": "Compliant with the Philippine Organic Agriculture Act. Strictly non-chemical fertilizers or synthetics used.",
  "PGS Certified": "Participatory Guarantee System. A locally anchored organic certification built on community-vetted farmer trust.",
  "Halal Certified": "Validates food handling and processing lines align explicitly with Islamic dietary laws and sanitation guidelines.",
  "GAqP Certified": "Good Aquaculture Practices. Confirms sanitary, disease-controlled environments for raised fish and seafood items.",
  "NMIS Approved": "National Meat Inspection Service. Guarantees fresh meat products passed rigorous post-mortem safety benchmarks."
};

const DEFAULT_FORM = {
  name: "",
  description: "",
  type: 1,
  price: "50",
  quantity: "",
  unit: "kg",
  region: "NCR / Metro Manila",
  image: "",
  promoted: false,
  certifications: []
};

export default function AddProductModal({ open, onClose, onCreated, onSaved, showToast, product, mode = 'add' }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && product) {
        setForm({
          name: product.name || "",
          description: product.description || "",
          type: product.type || 1,
          price: product.price?.toString() || "50",
          quantity: product.quantity?.toString() || "",
          unit: product.unit || "kg",
          region: product.region || "NCR / Metro Manila",
          image: product.image || "",
          promoted: Boolean(product.promoted),
          certifications: product.certifications || [],
        });
      } else {
        setForm(DEFAULT_FORM);
      }
      setError("");
    }
  }, [open, mode, product]);

  if (!open) return null;

  const handleChange = (field) => (event) => {
    const value = event.target.type === "checkbox"
      ? event.target.checked
      : event.target.value;

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCertToggle = (cert) => {
    setForm((prev) => {
      const currentCerts = prev.certifications || [];
      const updatedCerts = currentCerts.includes(cert)
        ? currentCerts.filter((c) => c !== cert)
        : [...currentCerts, cert];
      return { ...prev, certifications: updatedCerts };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      type: Number(form.type),
      price: Number(form.price),
      quantity: Number(form.quantity),
      unit: form.unit.trim() || "kg",
      region: form.region,
      image: form.image.trim() || undefined,
      promoted: form.promoted,
      certifications: form.certifications, 
    };

    if (!payload.name || !payload.description || isNaN(payload.price) || isNaN(payload.quantity)) {
      setError("Please complete the form with valid product details.");
      setLoading(false);
      return;
    }

    try {
      if (mode === 'edit' && product) {
        await adminAPI.updateProduct(product.id || product._id, payload);
        showToast("Product updated successfully.");
        onSaved?.();
      } else {
        await adminAPI.createProduct(payload);
        showToast("Product added successfully.");
        onCreated?.();
      }
      onClose();
    } catch (err) {
      setError(err?.message || "Unable to save the product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <p className={styles.label}>Admin action</p>
            <h2 className={styles.title}>{mode === 'edit' ? 'Edit marketplace product' : 'Add a new marketplace product'}</h2>
            <p className={styles.subtitle}>
              {mode === 'edit'
                ? 'Update the product details used for customer listings.'
                : 'Create a fresh product listing for customers to browse.'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close add product modal">
            ✕
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}> 
            <label className={styles.field}>
              <span>Name</span>
              <input
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Fresh mangoes"
                autoFocus
              />
            </label>

            <label className={styles.field}>
              <span>Type</span>
              <select value={form.type} onChange={handleChange("type")}> 
                {PRODUCT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange("price")}
                placeholder="45"
              />
            </label>

            <label className={styles.field}>
              <span>Quantity</span>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={handleChange("quantity")}
                placeholder="20"
              />
            </label>

            <label className={styles.field}>
              <span>Unit {form.price && `(₱${form.price}/${form.unit || 'unit'})`}</span>
              <input
                value={form.unit}
                onChange={handleChange("unit")}
                placeholder="kg"
              />
            </label>

            <label className={styles.field}>
              <span>Region</span>
              <select value={form.region} onChange={handleChange("region")}> 
                {REGION_OPTIONS.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
            <span>Product Certifications</span>
            <div className={styles.certGrid}>
              {Object.keys(CERTIFICATION_DETAILS).map((cert) => {
                const isChecked = form.certifications.includes(cert);
                return (
                  <div 
                    key={cert} 
                    className={`${styles.certChip} ${isChecked ? styles.certChipActive : ""}`}
                    onClick={() => handleCertToggle(cert)}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className={styles.certCheckbox}
                    />
                    <span className={styles.certLabel}>{cert}</span>
                    
                    <div className={styles.tooltipIcon} onClick={(e) => e.stopPropagation()}>
                      ?
                      <div className={styles.tooltipContent}>
                        <strong>{cert}</strong>
                        <p>{CERTIFICATION_DETAILS[cert]}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <label className={styles.field} style={{ gridColumn: "1 / -1" }}>
            <span>Description</span>
            <textarea
              rows="4"
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Describe the product quality, origin, and best use."
            />
          </label>

          <label className={styles.field} style={{ gridColumn: "1 / -1" }}>
            <span>Image URL</span>
            <input
              value={form.image}
              onChange={handleChange("image")}
              placeholder="https://example.com/image.png"
            />
          </label>

          <div className={styles.row}> 
            <label className={styles.checkboxField}>
              <input
                type="checkbox"
                checked={form.promoted}
                onChange={handleChange("promoted")}
              />
              <span>Promoted Product</span>
            </label>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Saving..." : mode === 'edit' ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
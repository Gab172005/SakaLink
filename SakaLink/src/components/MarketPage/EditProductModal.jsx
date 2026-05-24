import AddProductModal from './AddProductModal';

export default function EditProductModal({ open, product, onClose, onUpdated, showToast }) {
  return (
    <AddProductModal
      open={open}
      onClose={onClose}
      product={product}
      mode="edit"
      onSaved={onUpdated}
      showToast={showToast}
    />
  );
}

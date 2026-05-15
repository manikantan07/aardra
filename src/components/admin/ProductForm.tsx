'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Product, Category } from '@/types';

interface Props {
  product?: Partial<Product>;
  categories: Category[];
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ product, categories, onSave, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData(e.currentTarget);
      await onSave(fd);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card border-0 shadow-sm rounded-3"
    >
      <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between py-3">
        <h6 className="mb-0 fw-bold">{product?.id ? 'Edit Product' : 'Add New Product'}</h6>
        <button className="btn-close btn-close-white btn-sm" onClick={onCancel} aria-label="Cancel" />
      </div>
      <div className="card-body p-4">
        {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Product Name *</label>
              <input name="name" className="form-control" defaultValue={product?.name} required placeholder="e.g. Premium Wireless Headphones" />
            </div>
            <div className="col-md-4">
              <label className="form-label">SKU</label>
              <input name="sku" className="form-control" defaultValue={product?.sku ?? ''} placeholder="e.g. ELEC-001" />
            </div>

            <div className="col-12">
              <label className="form-label">Description *</label>
              <textarea name="description" className="form-control" rows={4} defaultValue={product?.description} required placeholder="Product description..." />
            </div>

            <div className="col-md-4">
              <label className="form-label">Price ($) *</label>
              <input name="price" type="number" step="0.01" min="0" className="form-control" defaultValue={product?.price} required placeholder="0.00" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Compare Price ($)</label>
              <input name="comparePrice" type="number" step="0.01" min="0" className="form-control" defaultValue={product?.comparePrice ?? ''} placeholder="0.00 (optional)" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Stock *</label>
              <input name="stock" type="number" min="0" className="form-control" defaultValue={product?.stock} required placeholder="0" />
            </div>

            <div className="col-md-6">
              <label className="form-label">Category *</label>
              <select name="categoryId" className="form-select" defaultValue={product?.categoryId} required>
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Images (comma-separated URLs) *</label>
              <input name="images" className="form-control" defaultValue={product?.images?.join(', ')} required placeholder="https://…, https://…" />
            </div>

            <div className="col-12">
              <div className="d-flex gap-4">
                <div className="form-check form-switch">
                  <input name="featured" type="checkbox" className="form-check-input" id="featured" defaultChecked={product?.featured} role="switch" />
                  <label className="form-check-label" htmlFor="featured">Featured Product</label>
                </div>
                <div className="form-check form-switch">
                  <input name="isActive" type="checkbox" className="form-check-input" id="isActive" defaultChecked={product?.isActive ?? true} role="switch" />
                  <label className="form-check-label" htmlFor="isActive">Active (visible)</label>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-accent rounded-pill px-4" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
              {product?.id ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

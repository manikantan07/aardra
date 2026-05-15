'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { createProduct, updateProduct, deleteProduct } from '@/actions/productActions';
import ProductForm from '@/components/admin/ProductForm';
import { formatPrice } from '@/lib/utils';
import type { Product, Category } from '@/types';

interface Props {
  products: Product[];
  categories: Category[];
}

export default function AdminProductsClient({ products: initialProducts, categories }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: FormData) => {
    if (editing) {
      await updateProduct(editing.id, data);
      toast.success('Product updated');
    } else {
      await createProduct(data);
      toast.success('Product created');
    }
    setShowForm(false);
    setEditing(null);
    window.location.reload();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await deleteProduct(id);
    setProducts((p) => p.filter((x) => x.id !== id));
    toast.success('Product deleted');
  };

  return (
    <>
      <div className="admin-header">
        <h1>Products</h1>
        <button
          className="btn btn-accent rounded-pill px-4"
          onClick={() => { setEditing(null); setShowForm(true); }}
        >
          + Add Product
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="mb-4"
          >
            <ProductForm
              product={editing ?? undefined}
              categories={categories}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-3">
        <input
          type="search"
          className="form-control"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
          style={{ maxWidth: 320 }}
        />
      </div>

      <div className="admin-table">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">No products found</td>
                </tr>
              )}
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
                        <Image
                          src={product.images[0] ?? ''}
                          alt={product.name}
                          fill
                          style={{ objectFit: 'cover', borderRadius: 6 }}
                          sizes="44px"
                        />
                      </div>
                      <div>
                        <div className="fw-semibold" style={{ fontSize: '0.875rem' }}>{product.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>{product.category?.name}</td>
                  <td className="fw-semibold">{formatPrice(product.price)}</td>
                  <td>
                    <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${product.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => { setEditing(product); setShowForm(true); }}
                        aria-label={`Edit ${product.name}`}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(product.id, product.name)}
                        aria-label={`Delete ${product.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

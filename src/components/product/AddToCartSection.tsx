'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import ProductVariants from './ProductVariants';
import type { Product } from '@/types';

interface Props {
  product: Product;
}

export default function AddToCartSection({ product }: Props) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleVariantChange = (name: string, option: string) => {
    setSelectedVariants((prev) => ({ ...prev, [name]: option }));
  };

  const allVariantsSelected = product.variants.every((v) => selectedVariants[v.name]);

  const handleAddToCart = async () => {
    if (product.variants.length > 0 && !allVariantsSelected) {
      toast.error('Please select all options before adding to cart');
      return;
    }
    if (product.stock === 0) return;

    setAdding(true);
    const variantKey = Object.keys(selectedVariants).length > 0
      ? `-${Object.values(selectedVariants).join('-')}`
      : '';

    addItem({
      id: `${product.id}${variantKey}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? '',
      quantity,
      variant: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined,
      stock: product.stock,
    });

    toast.success(`${product.name} added to cart! 🛒`);
    await new Promise((r) => setTimeout(r, 400));
    setAdding(false);
  };

  return (
    <div>
      {product.variants.length > 0 && (
        <ProductVariants
          variants={product.variants}
          selected={selectedVariants}
          onChange={handleVariantChange}
        />
      )}

      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="d-flex align-items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="qty-btn"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            −
          </motion.button>
          <span className="qty-display">{quantity}</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="qty-btn"
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            disabled={quantity >= product.stock}
            aria-label="Increase quantity"
          >
            +
          </motion.button>
        </div>
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
          {product.stock} in stock
        </span>
      </div>

      <div className="d-flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="btn btn-cart flex-grow-1 py-3"
          style={{ fontSize: '1rem' }}
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          aria-label={`Add ${product.name} to cart`}
        >
          {adding ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" />
          ) : null}
          {product.stock === 0 ? '⚠ Out of Stock' : adding ? 'Adding…' : '🛒 Add to Cart'}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="btn btn-outline-secondary py-3 px-3"
          style={{ borderRadius: '50%', width: 52, height: 52, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Add to wishlist"
        >
          ♡
        </motion.button>
      </div>
    </div>
  );
}

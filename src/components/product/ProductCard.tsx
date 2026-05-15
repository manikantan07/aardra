'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, calculateDiscount, getAverageRating } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';
import type { Product } from '@/types';

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const avgRating = getAverageRating(product.ratings);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;

    setAdding(true);
    addItem({
      id: `${product.id}-default`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? '',
      quantity: 1,
      stock: product.stock,
    });
    toast.success(`${product.name} added to cart! 🛒`, {
      duration: 2000,
      style: { fontSize: '0.875rem', fontWeight: 600 },
    });
    await new Promise((r) => setTimeout(r, 400));
    setAdding(false);
  };

  const discount = product.comparePrice
    ? calculateDiscount(product.price, product.comparePrice)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="h-100"
    >
      <Link href={`/products/${product.id}`} className="text-decoration-none d-block h-100">
        <div className="product-card h-100">
          <div className="product-card__image">
            <Image
              src={product.images[0] ?? 'https://via.placeholder.com/400'}
              alt={product.name}
              fill
              sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 25vw"
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />

            <div className="product-card__badge">
              {discount && (
                <span className="badge-discount">-{discount}%</span>
              )}
              {product.featured && (
                <span className="badge-featured">Featured</span>
              )}
            </div>

            <button
              className="product-card__wishlist"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              aria-label="Add to wishlist"
            >
              ♡
            </button>

            <div className="product-card__actions">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="btn btn-sm btn-accent rounded-pill flex-grow-1"
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                aria-label={`Add ${product.name} to cart`}
              >
                {adding ? (
                  <span className="spinner-border spinner-border-sm me-1" role="status" />
                ) : (
                  '🛒 '
                )}
                {product.stock === 0 ? 'Out of Stock' : adding ? 'Adding…' : 'Add to Cart'}
              </motion.button>
              <Link
                href={`/products/${product.id}`}
                className="btn btn-sm rounded-pill"
                style={{ background: 'rgba(255,255,255,0.9)', color: '#1a1a2e', flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                👁
              </Link>
            </div>
          </div>

          <div className="product-card__body">
            <div className="product-card__category">{product.category.name}</div>
            <h3 className="product-card__name">{product.name}</h3>
            {product.ratings.length > 0 && (
              <div className="product-card__rating">
                <StarRating score={avgRating} />
                <span className="count">({product.ratings.length})</span>
              </div>
            )}
            <div className="product-card__price">
              <span className="price-current">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="price-compare">{formatPrice(product.comparePrice)}</span>
              )}
            </div>
            {product.stock === 0 && (
              <span className="badge bg-danger mt-2" style={{ fontSize: '0.7rem' }}>Out of Stock</span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="badge bg-warning text-dark mt-2" style={{ fontSize: '0.7rem' }}>
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

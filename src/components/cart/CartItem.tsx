'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import type { CartStoreItem } from '@/types';

interface Props {
  item: CartStoreItem;
}

export default function CartItem({ item }: Props) {
  const { removeItem, updateQuantity } = useCartStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
      className="cart-item-row"
    >
      <div className="cart-item-row__image">
        <Image
          src={item.image}
          alt={item.name}
          fill
          style={{ objectFit: 'cover' }}
          sizes="90px"
        />
      </div>

      <div className="cart-item-row__info flex-grow-1">
        <Link href={`/products/${item.productId}`} className="cart-item-row__name">
          {item.name}
        </Link>
        {item.variant && Object.keys(item.variant).length > 0 && (
          <div className="cart-item-row__variant">
            {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(' · ')}
          </div>
        )}
        <div className="d-flex align-items-center gap-3 mt-2">
          <div className="d-flex align-items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="qty-btn"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </motion.button>
            <motion.span
              key={item.quantity}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="qty-display"
            >
              {item.quantity}
            </motion.span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="qty-btn"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              aria-label="Increase quantity"
            >
              +
            </motion.button>
          </div>
          <button
            className="btn btn-link text-danger p-0 text-decoration-none"
            style={{ fontSize: '0.8rem' }}
            onClick={() => removeItem(item.id)}
            aria-label={`Remove ${item.name}`}
          >
            Remove
          </button>
        </div>
      </div>

      <div className="cart-item-row__price">
        {formatPrice(item.price * item.quantity)}
        {item.quantity > 1 && (
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
            {formatPrice(item.price)} each
          </div>
        )}
      </div>
    </motion.div>
  );
}

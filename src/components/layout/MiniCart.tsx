'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCart({ isOpen, onClose }: Props) {
  const { items, removeItem, updateQuantity, getSubtotal, getTax, getShipping, getGrandTotal } = useCartStore();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1044 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="mini-cart position-fixed top-0 end-0 h-100 d-flex flex-column"
        style={{ width: 380, maxWidth: '95vw', zIndex: 1045, background: '#fff' }}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">
            🛒 Shopping Cart
            {items.length > 0 && (
              <span className="badge bg-accent ms-2" style={{ fontSize: '0.7rem' }}>
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </h5>
          <button
            onClick={onClose}
            className="btn-close btn-close-white"
            aria-label="Close cart"
          />
        </div>

        <div className="offcanvas-body" style={{ overflowY: 'auto', flex: 1 }}>
          {items.length === 0 ? (
            <div className="mini-cart__empty">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="icon"
              >
                🛒
              </motion.div>
              <p className="fw-semibold text-muted">Your cart is empty</p>
              <button onClick={onClose} className="btn btn-accent btn-sm rounded-pill mt-2 px-4">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="mini-cart__items">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mini-cart__item"
                  >
                    <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        style={{ objectFit: 'cover', borderRadius: 6 }}
                        sizes="64px"
                      />
                    </div>
                    <div className="mini-cart__item-info">
                      <div className="name">{item.name}</div>
                      {item.variant && Object.keys(item.variant).length > 0 && (
                        <div className="variant">
                          {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </div>
                      )}
                      <div className="price">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                    <div className="mini-cart__item-actions">
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        ✕
                      </button>
                      <div className="mini-cart__item-qty">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="mini-cart__footer">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(getSubtotal())}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>{formatPrice(getTax())}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{getShipping() === 0 ? <span className="free-badge">Free</span> : formatPrice(getShipping())}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(getGrandTotal())}</span>
            </div>
            <div className="cart-actions">
              <Link href="/cart" className="btn btn-outline-primary rounded-pill text-center" onClick={onClose}>
                View Cart
              </Link>
              <Link href="/checkout" className="btn btn-accent rounded-pill text-center" onClick={onClose}>
                Checkout →
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}

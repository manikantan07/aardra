'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyState from '@/components/ui/EmptyState';

export default function CartPage() {
  const { items, clearCart } = useCartStore();

  return (
    <div className="section">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="section-title mb-0">Shopping Cart</h1>
          {items.length > 0 && (
            <button
              className="btn btn-outline-danger btn-sm rounded-pill"
              onClick={clearCart}
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            description="Looks like you haven't added anything to your cart yet. Start shopping and find something you love!"
            actionLabel="Browse Products"
            actionHref="/products"
          />
        ) : (
          <div className="row g-4 align-items-start">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-3 p-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </AnimatePresence>

                <div className="mt-3 pt-3 border-top">
                  <Link href="/products" className="text-decoration-none text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.875rem' }}>
                    ← Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <CartSummary />
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

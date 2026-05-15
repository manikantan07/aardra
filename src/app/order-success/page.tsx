'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const clearCart = useCartStore((s) => s.clearCart);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!cleared) {
      clearCart();
      setCleared(true);
    }
  }, [clearCart, cleared]);

  return (
    <div className="section">
      <div className="container">
        <div className="success-page">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="success-page__icon"
          >
            ✓
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h2>Order Placed Successfully!</h2>
            <p>
              Thank you for your purchase! We&apos;ve received your order and are processing it now.
              You&apos;ll receive a confirmation email shortly.
            </p>

            {sessionId && (
              <div
                className="d-inline-block px-4 py-2 rounded-3 mb-4"
                style={{ background: '#f8f9fa', fontSize: '0.825rem', color: '#888' }}
              >
                Order reference: <strong style={{ fontFamily: 'monospace' }}>{sessionId.slice(-12).toUpperCase()}</strong>
              </div>
            )}

            <div className="row g-3 mb-4" style={{ maxWidth: 500, margin: '0 auto 2rem' }}>
              {[
                { icon: '📦', title: 'Processing', desc: "We're preparing your order" },
                { icon: '🚚', title: '2–5 Days', desc: 'Estimated delivery time' },
                { icon: '📧', title: 'Email Sent', desc: 'Check your inbox' },
              ].map((step) => (
                <div key={step.title} className="col-4">
                  <div className="text-center">
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{step.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.825rem', color: '#1a1a2e' }}>{step.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link href="/account" className="btn btn-primary rounded-pill px-5">
                View My Orders
              </Link>
              <Link href="/products" className="btn btn-outline-secondary rounded-pill px-5">
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccessContent />
    </Suspense>
  );
}

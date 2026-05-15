'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { createCheckoutSession } from '@/actions/orderActions';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import CartSummary from '@/components/cart/CartSummary';
import EmptyState from '@/components/ui/EmptyState';
import type { ShippingAddress } from '@/types';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items } = useCartStore();
  const [loading, setLoading] = useState(false);

  if (status === 'unauthenticated') {
    return (
      <div className="section">
        <div className="container">
          <div className="text-center py-5">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h2 className="fw-bold mb-2">Sign in to Continue</h2>
            <p className="text-muted mb-4">Please sign in to your account to complete your purchase.</p>
            <Link href="/auth/login?callbackUrl=/checkout" className="btn btn-accent rounded-pill px-5">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="section">
        <div className="container">
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            description="Add some products to your cart before checking out."
            actionLabel="Browse Products"
            actionHref="/products"
          />
        </div>
      </div>
    );
  }

  const handleCheckout = async (address: ShippingAddress) => {
    if (!session) { router.push('/auth/login'); return; }
    setLoading(true);
    try {
      const result = await createCheckoutSession(items, address);
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      toast.error('Failed to create checkout session. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        {/* Steps */}
        <div className="checkout-steps mb-4">
          <div className="step done">
            <div className="step__number">✓</div>
            <div className="step__label">Cart</div>
          </div>
          <div className="step-divider" />
          <div className="step active">
            <div className="step__number">2</div>
            <div className="step__label">Details</div>
          </div>
          <div className="step-divider" />
          <div className="step">
            <div className="step__number">3</div>
            <div className="step__label">Payment</div>
          </div>
        </div>

        <div className="row g-4 align-items-start">
          <div className="col-lg-7">
            <h2 className="section-title mb-4">Shipping Details</h2>
            <CheckoutForm onSubmit={handleCheckout} loading={loading} />
          </div>

          <div className="col-lg-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="section-title mb-4">Order Summary</h2>
              <CartSummary showCheckoutButton={false} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

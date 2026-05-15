'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/utils';

interface Props {
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
  loading?: boolean;
}

export default function CartSummary({ showCheckoutButton = true, onCheckout, loading }: Props) {
  const { getSubtotal, getTax, getShipping, getGrandTotal, items } = useCartStore();

  const subtotal = getSubtotal();
  const tax = getTax();
  const shipping = getShipping();
  const total = getGrandTotal();

  return (
    <div className="cart-summary-card">
      <h5>Order Summary</h5>

      <div className="summary-row">
        <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="summary-row">
        <span>Tax (8%)</span>
        <span>{formatPrice(tax)}</span>
      </div>
      <div className="summary-row">
        <span>Shipping</span>
        <span>
          {shipping === 0 ? (
            <span className="free-badge">Free</span>
          ) : (
            formatPrice(shipping)
          )}
        </span>
      </div>

      {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
        <div
          className="mt-2 p-2 rounded"
          style={{ background: 'rgba(255,255,255,0.08)', fontSize: '0.775rem', color: 'rgba(255,255,255,0.7)' }}
        >
          Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping 🚚
        </div>
      )}

      <div className="summary-row total">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      {showCheckoutButton && (
        <>
          {onCheckout ? (
            <button
              className="checkout-btn"
              onClick={onCheckout}
              disabled={loading || items.length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Redirecting…
                </>
              ) : (
                '🔒 Proceed to Checkout'
              )}
            </button>
          ) : (
            <Link href="/checkout" className="checkout-btn d-block text-center text-decoration-none">
              🔒 Proceed to Checkout
            </Link>
          )}
          <Link href="/products" className="continue-link">
            ← Continue Shopping
          </Link>
        </>
      )}

      <div className="mt-3 text-center" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
        🔒 SSL Encrypted · 🛡 Secure Checkout · ↩ Free Returns
      </div>
    </div>
  );
}

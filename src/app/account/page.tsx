import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { getOrdersByUser } from '@/actions/orderActions';
import { formatPrice, formatDate } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'My Account' };

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login?callbackUrl=/account');

  const orders = await getOrdersByUser(session.user.id);

  return (
    <div className="section">
      <div className="container">
        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm rounded-3 p-4 text-center mb-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #1a1a2e, #e94560)', fontSize: '1.75rem', color: '#fff' }}
              >
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
              <h6 className="fw-bold mb-1">{session.user.name}</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>{session.user.email}</p>
              {session.user.role === 'ADMIN' && (
                <span className="badge bg-accent mt-2">Admin</span>
              )}
            </div>

            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
              {[
                { label: '📦 Orders', href: '/account' },
                { label: '👤 Profile', href: '/account' },
                ...(session.user.role === 'ADMIN' ? [{ label: '⚙️ Admin Panel', href: '/admin' }] : []),
              ].map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="d-block px-3 py-2 text-decoration-none border-bottom"
                  style={{ fontSize: '0.875rem', color: '#444', transition: 'background 0.15s' }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="col-md-9">
            <h2 className="section-title mb-4">My Orders</h2>

            {orders.length === 0 ? (
              <EmptyState
                icon="📦"
                title="No orders yet"
                description="When you place your first order, it'll show up here."
                actionLabel="Start Shopping"
                actionHref="/products"
              />
            ) : (
              <div className="d-flex flex-column gap-3">
                {orders.map((order) => (
                  <div key={order.id} className="card border-0 shadow-sm rounded-3 p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.825rem', fontFamily: 'monospace' }}>
                          #{order.id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.775rem' }}>
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                        </span>
                        <strong>{formatPrice(order.total)}</strong>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="d-flex align-items-center gap-3">
                          <div style={{ fontSize: '0.875rem', flex: 1 }}>
                            <span className="fw-semibold">{item.product.name}</span>
                            {item.variant && (
                              <span className="text-muted ms-2" style={{ fontSize: '0.775rem' }}>
                                {Object.entries(item.variant as Record<string, string>).map(([k, v]) => `${k}: ${v}`).join(', ')}
                              </span>
                            )}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.825rem' }}>×{item.quantity}</div>
                          <div className="fw-semibold" style={{ fontSize: '0.875rem' }}>{formatPrice(item.price * item.quantity)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center" style={{ fontSize: '0.825rem', color: '#888' }}>
                      <span>Shipped to: {(order.shippingAddress as { city: string; state: string }).city}, {(order.shippingAddress as { city: string; state: string }).state}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

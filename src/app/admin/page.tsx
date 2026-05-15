import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { getDashboardStats, getAllOrders } from '@/actions/orderActions';
import { formatPrice, formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/');

  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    getAllOrders().then((o) => o.slice(0, 5)),
  ]);

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: '💰', color: '#e94560' },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: '📦', color: '#3b82f6' },
    { label: 'Products', value: stats.totalProducts.toLocaleString(), icon: '🛍', color: '#10b981' },
    { label: 'Customers', value: stats.totalUsers.toLocaleString(), icon: '👥', color: '#f59e0b' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-layout__sidebar">
        <div className="sidebar-brand">
          <h5>Aard<span>ra</span></h5>
          <small>Admin Panel</small>
        </div>
        <nav className="sidebar-nav">
          {[
            { icon: '📊', label: 'Dashboard', href: '/admin' },
            { icon: '📦', label: 'Orders', href: '/admin/orders' },
            { icon: '🛍', label: 'Products', href: '/admin/products' },
            { icon: '🏷', label: 'Categories', href: '/admin' },
            { icon: '👥', label: 'Customers', href: '/admin' },
          ].map((item) => (
            <div key={item.href + item.label} className="nav-item">
              <Link
                href={item.href}
                className={`nav-link ${item.href === '/admin' ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            </div>
          ))}
          <div className="nav-item mt-4">
            <Link href="/" className="nav-link" style={{ opacity: 0.7 }}>
              <span className="nav-icon">←</span>
              Back to Store
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className="admin-layout__main">
        <div className="admin-header">
          <div>
            <h1>Dashboard</h1>
            <p className="text-muted small mb-0">Welcome back, {session.user.name}!</p>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {statCards.map((card) => (
            <div key={card.label} className="col-6 col-xl-3">
              <div className="stat-card">
                <div className="stat-card__icon" style={{ background: `${card.color}18` }}>
                  <span style={{ fontSize: '1.4rem' }}>{card.icon}</span>
                </div>
                <div>
                  <div className="stat-card__value">{card.value}</div>
                  <div className="stat-card__label">{card.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="row g-3 mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-3 p-3">
              <h6 className="fw-bold mb-3">Quick Actions</h6>
              <div className="d-flex gap-2 flex-wrap">
                <Link href="/admin/products" className="btn btn-accent btn-sm rounded-pill">+ Add Product</Link>
                <Link href="/admin/orders" className="btn btn-outline-primary btn-sm rounded-pill">Manage Orders</Link>
                <Link href="/products" className="btn btn-outline-secondary btn-sm rounded-pill" target="_blank">View Store ↗</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0">Recent Orders</h5>
            <Link href="/admin/orders" className="btn btn-outline-primary btn-sm rounded-pill">View All</Link>
          </div>
          <div className="admin-table">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>
                        {order.user?.name ?? (order.shippingAddress as { firstName: string }).firstName}
                      </td>
                      <td className="fw-semibold">{formatPrice(order.total)}</td>
                      <td style={{ color: '#888', fontSize: '0.825rem' }}>{formatDate(order.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">No orders yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

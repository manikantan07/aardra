import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { getAllOrders, updateOrderStatus } from '@/actions/orderActions';
import OrdersTable from '@/components/admin/OrdersTable';
import type { OrderStatus } from '@/types';

export const metadata: Metadata = { title: 'Manage Orders | Admin' };

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/');

  const orders = await getAllOrders();

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    'use server';
    await updateOrderStatus(orderId, status);
  }

  return (
    <div className="admin-layout">
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
          ].map((item) => (
            <div key={item.href} className="nav-item">
              <Link
                href={item.href}
                className={`nav-link ${item.href === '/admin/orders' ? 'active' : ''}`}
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

      <main className="admin-layout__main">
        <div className="admin-header">
          <h1>Orders</h1>
          <span className="badge bg-secondary">{orders.length} total</span>
        </div>
        <OrdersTable orders={orders as never} onStatusChange={handleStatusChange} />
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

interface Props {
  orders: Order[];
  onStatusChange?: (orderId: string, status: OrderStatus) => Promise<void>;
}

const statuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function OrdersTable({ orders, onStatusChange }: Props) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatus = async (orderId: string, status: OrderStatus) => {
    if (!onStatusChange) return;
    setUpdating(orderId);
    await onStatusChange(orderId, status);
    setUpdating(null);
  };

  return (
    <div className="admin-table">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              {onStatusChange && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted py-5">No orders found</td>
              </tr>
            )}
            {orders.map((order) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <td>
                  <span className="fw-semibold" style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '0.875rem' }}>
                    <div className="fw-semibold">{(order.shippingAddress as { firstName: string; lastName: string }).firstName} {(order.shippingAddress as { firstName: string; lastName: string }).lastName}</div>
                    <div className="text-muted" style={{ fontSize: '0.775rem' }}>{(order.shippingAddress as { email: string }).email}</div>
                  </div>
                </td>
                <td>
                  <span className="badge bg-light text-dark">{order.items.length} items</span>
                </td>
                <td className="fw-bold">{formatPrice(order.total)}</td>
                <td style={{ fontSize: '0.825rem', color: '#888' }}>{formatDate(order.createdAt)}</td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                  </span>
                </td>
                {onStatusChange && (
                  <td>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 140, fontSize: '0.8rem' }}
                      value={order.status}
                      onChange={(e) => handleStatus(order.id, e.target.value as OrderStatus)}
                      disabled={updating === order.id}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

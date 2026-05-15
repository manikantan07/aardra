'use server';

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { authOptions } from '@/lib/auth';
import type { CartStoreItem, ShippingAddress, OrderStatus } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createCheckoutSession(
  items: CartStoreItem[],
  shippingAddress: ShippingAddress
) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: session.user.email!,
    line_items: items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image],
          description: item.variant
            ? Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(', ')
            : undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: Math.round(shipping * 100), currency: 'usd' },
          display_name: shipping === 0 ? 'Free Shipping' : 'Standard Shipping',
        },
      },
    ],
    metadata: {
      userId: session.user.id,
      shippingAddress: JSON.stringify(shippingAddress),
      orderItems: JSON.stringify(
        items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          variant: i.variant ?? null,
        }))
      ),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
    },
    success_url: `${appUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout`,
  });

  return { url: stripeSession.url };
}

export async function getOrdersByUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { category: true, variants: true, ratings: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllOrders() {
  return prisma.order.findMany({
    include: {
      user: true,
      items: {
        include: { product: { include: { category: true, variants: true, ratings: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath('/admin/orders');
  revalidatePath('/account');
}

export async function getOrderByStripeSession(sessionId: string) {
  return prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: {
      items: {
        include: { product: { include: { category: true, variants: true, ratings: true } } },
      },
    },
  });
}

export async function getDashboardStats() {
  const [totalOrders, totalProducts, totalUsers, revenueResult] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
  ]);

  return {
    totalOrders,
    totalProducts,
    totalUsers,
    totalRevenue: revenueResult._sum.total ?? 0,
  };
}

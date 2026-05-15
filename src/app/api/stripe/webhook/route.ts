import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata!;

    try {
      const orderItems: Array<{
        productId: string;
        quantity: number;
        price: number;
        variant: Record<string, string> | null;
      }> = JSON.parse(meta.orderItems);

      await prisma.order.create({
        data: {
          userId: meta.userId,
          stripeSessionId: session.id,
          status: 'PROCESSING',
          subtotal: parseFloat(meta.subtotal),
          tax: parseFloat(meta.tax),
          shipping: parseFloat(meta.shipping),
          total: parseFloat(meta.total),
          shippingAddress: JSON.parse(meta.shippingAddress),
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              variant: item.variant ?? undefined,
            })),
          },
        },
      });

      // Decrement stock
      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    } catch (err) {
      console.error('Failed to create order from webhook:', err);
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

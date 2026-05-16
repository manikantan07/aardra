import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    include: { category: true, ratings: true },
    take: 100,
  });

  const data = products.map((p, i) => ({
    rank: i + 1,
    id: p.id,
    name: p.name,
    category: p.category?.name ?? 'Uncategorised',
    price: Number(p.price),
    stock: p.stock,
    featured: p.featured,
    revenue: Number(p.price) * Math.max(1, Math.floor(p.stock * 0.4)),
    units: Math.max(1, Math.floor(p.stock * 0.4)),
    rating: p.ratings?.length
      ? +(p.ratings.reduce((s: number, r) => s + r.score, 0) / p.ratings.length).toFixed(1)
      : 4.5,
    trend: p.featured ? 'up' : 'stable',
    slug: p.id,
  }));

  return NextResponse.json({ products: data });
}

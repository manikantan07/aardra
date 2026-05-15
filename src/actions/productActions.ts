'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { generateSlug, ITEMS_PER_PAGE } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import type { ProductFilters, PaginatedProducts } from '@/types';

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedProducts> {
  const {
    category,
    minPrice,
    maxPrice,
    inStock,
    search,
    sort = 'newest',
    page = 1,
    limit = ITEMS_PER_PAGE,
  } = filters;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(category && { category: { slug: category } }),
    ...(minPrice !== undefined && { price: { gte: minPrice } }),
    ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
    ...(inStock && { stock: { gt: 0 } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ],
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price-asc' ? { price: 'asc' }
    : sort === 'price-desc' ? { price: 'desc' }
    : sort === 'featured' ? { featured: 'desc' }
    : { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true, variants: true, ratings: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products as never,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true, variants: true, ratings: true },
  });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true, isActive: true },
    take: 8,
    include: { category: true, variants: true, ratings: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function createProduct(data: FormData) {
  const name = data.get('name') as string;
  const description = data.get('description') as string;
  const price = parseFloat(data.get('price') as string);
  const comparePrice = data.get('comparePrice') ? parseFloat(data.get('comparePrice') as string) : null;
  const stock = parseInt(data.get('stock') as string);
  const categoryId = data.get('categoryId') as string;
  const sku = data.get('sku') as string || null;
  const imagesRaw = data.get('images') as string;
  const images = imagesRaw.split(',').map((s) => s.trim()).filter(Boolean);
  const featured = data.get('featured') === 'on';
  const isActive = data.get('isActive') !== 'off';

  const slug = generateSlug(name);

  await prisma.product.create({
    data: {
      name, slug, description, price, comparePrice, stock,
      categoryId, sku, images, featured, isActive,
    },
  });

  revalidatePath('/products');
  revalidatePath('/admin/products');
}

export async function updateProduct(id: string, data: FormData) {
  const name = data.get('name') as string;
  const description = data.get('description') as string;
  const price = parseFloat(data.get('price') as string);
  const comparePrice = data.get('comparePrice') ? parseFloat(data.get('comparePrice') as string) : null;
  const stock = parseInt(data.get('stock') as string);
  const categoryId = data.get('categoryId') as string;
  const sku = data.get('sku') as string || null;
  const imagesRaw = data.get('images') as string;
  const images = imagesRaw.split(',').map((s) => s.trim()).filter(Boolean);
  const featured = data.get('featured') === 'on';
  const isActive = data.get('isActive') !== 'off';

  await prisma.product.update({
    where: { id },
    data: { name, description, price, comparePrice, stock, categoryId, sku, images, featured, isActive },
  });

  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  revalidatePath('/admin/products');
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath('/products');
  revalidatePath('/admin/products');
}

export async function getRelatedProducts(productId: string, categoryId: string) {
  return prisma.product.findMany({
    where: { categoryId, isActive: true, id: { not: productId } },
    take: 4,
    include: { category: true, variants: true, ratings: true },
  });
}

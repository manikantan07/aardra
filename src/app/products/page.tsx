import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getProducts, getCategories } from '@/actions/productActions';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilters from '@/components/product/ProductFilters';
import Pagination from '@/components/ui/Pagination';
import { ProductGridSkeleton } from '@/components/product/ProductCardSkeleton';
import EmptyState from '@/components/ui/EmptyState';

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse our full collection of premium electronics, fashion, and home décor.',
};

interface Props {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
    search?: string;
    inStock?: string;
    maxPrice?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const [{ products, total, totalPages }, categories] = await Promise.all([
    getProducts({
      category: params.category,
      sort: (params.sort as 'newest' | 'price-asc' | 'price-desc' | 'featured') ?? 'newest',
      page,
      search: params.search,
      inStock: params.inStock === '1',
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    }),
    getCategories(),
  ]);

  const activeFiltersCount = [
    params.category, params.inStock, params.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="section">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="section-title mb-1">
              {params.search ? `Search: "${params.search}"` : params.category ? categories.find((c) => c.slug === params.category)?.name ?? 'Products' : 'All Products'}
            </h1>
            <p className="text-muted small mb-0">
              {total} {total === 1 ? 'product' : 'products'} found
              {activeFiltersCount > 0 && ` · ${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active`}
            </p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-3">
            <Suspense>
              <ProductFilters categories={categories} />
            </Suspense>
          </div>

          <div className="col-lg-9">
            <Suspense fallback={<ProductGridSkeleton />}>
              {products.length === 0 ? (
                <EmptyState
                  icon="🔍"
                  title="No products found"
                  description="Try adjusting your filters or search terms to find what you're looking for."
                  actionLabel="Clear Filters"
                  actionHref="/products"
                />
              ) : (
                <>
                  <ProductGrid products={products as never} />
                  <Pagination currentPage={page} totalPages={totalPages} />
                </>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

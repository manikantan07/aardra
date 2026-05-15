import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProduct, getRelatedProducts } from '@/actions/productActions';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductCard from '@/components/product/ProductCard';
import AddToCartSection from '@/components/product/AddToCartSection';
import StarRating from '@/components/ui/StarRating';
import { formatPrice, calculateDiscount, getAverageRating } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: [{ url: product.images[0] ?? '' }],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId);
  const avgRating = getAverageRating(product.ratings);
  const discount = product.comparePrice ? calculateDiscount(product.price, product.comparePrice) : null;

  return (
    <div className="section">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb" style={{ fontSize: '0.825rem' }}>
            <li className="breadcrumb-item"><Link href="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/products" className="text-decoration-none">Products</Link></li>
            <li className="breadcrumb-item"><Link href={`/products?category=${product.category.slug}`} className="text-decoration-none">{product.category.name}</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="row g-5">
          {/* Left: Image gallery */}
          <div className="col-md-6">
            <ProductImageGallery images={product.images} name={product.name} />
          </div>

          {/* Right: Product info */}
          <div className="col-md-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge" style={{ background: '#f0f0f0', color: '#888', fontSize: '0.75rem' }}>
                {product.category.name}
              </span>
              {product.featured && (
                <span className="badge" style={{ background: '#e94560', fontSize: '0.7rem' }}>Featured</span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: '#1a1a2e', lineHeight: 1.2, marginBottom: '0.75rem' }}>
              {product.name}
            </h1>

            {product.ratings.length > 0 && (
              <div className="d-flex align-items-center gap-2 mb-3">
                <StarRating score={avgRating} size="md" />
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                  {avgRating.toFixed(1)} ({product.ratings.length} review{product.ratings.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            <div className="product-detail__price mb-3">
              <span className="price-main">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <>
                  <span className="price-compare">{formatPrice(product.comparePrice)}</span>
                  {discount && <span className="price-save">Save {discount}%</span>}
                </>
              )}
            </div>

            <p style={{ color: '#555', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {product.description}
            </p>

            {/* Add to cart with variants - client component */}
            <AddToCartSection product={product as never} />

            {/* Product meta */}
            <div className="mt-4 pt-4 border-top">
              <div className="row g-2" style={{ fontSize: '0.825rem', color: '#777' }}>
                {product.sku && (
                  <div className="col-6">SKU: <strong className="text-dark">{product.sku}</strong></div>
                )}
                <div className="col-6">
                  Stock:{' '}
                  <strong className={product.stock > 0 ? 'text-success' : 'text-danger'}>
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </strong>
                </div>
                <div className="col-6">Category: <Link href={`/products?category=${product.category.slug}`} className="text-decoration-none" style={{ color: '#e94560' }}>{product.category.name}</Link></div>
              </div>
            </div>

            {/* Delivery info */}
            <div className="mt-3 p-3 rounded-3" style={{ background: '#f8f9fa', fontSize: '0.825rem' }}>
              <div className="d-flex gap-3 flex-wrap">
                <span>🚚 Free shipping over $50</span>
                <span>↩ 30-day returns</span>
                <span>🔒 Secure checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-6">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 className="section-title mb-0">You Might Also Like</h2>
              <Link href={`/products?category=${product.category.slug}`} className="btn btn-outline-primary btn-sm rounded-pill">
                View All →
              </Link>
            </div>
            <div className="row g-3">
              {related.map((p, index) => (
                <div key={p.id} className="col-6 col-md-3">
                  <ProductCard product={p as never} index={index} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

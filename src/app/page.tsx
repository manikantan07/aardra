import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts, getCategories } from '@/actions/productActions';
import ProductCard from '@/components/product/ProductCard';
import HeroSection from '@/components/home/HeroSection';
import TrustBadges from '@/components/home/TrustBadges';

export const metadata: Metadata = {
  title: 'Aardra — Premium Shopping',
  description: 'Discover premium fashion, electronics, and home décor. Shop the latest trends with fast delivery.',
};

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <>
      <HeroSection />

      {/* Categories */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-label">Collections</p>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Explore our carefully curated collections</p>
          </div>
          <div className="row g-4">
            {categories.map((cat) => (
              <div key={cat.id} className="col-md-4">
                <Link href={`/products?category=${cat.slug}`} className="category-card d-block text-decoration-none">
                  <Image
                    src={cat.imageUrl ?? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600'}
                    alt={cat.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="category-card__content">
                    <h3>{cat.name}</h3>
                    <p>{cat.description}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <div className="d-flex align-items-end justify-content-between mb-5">
            <div>
              <p className="section-label">Handpicked</p>
              <h2 className="section-title mb-0">Featured Products</h2>
            </div>
            <Link href="/products" className="btn btn-outline-primary rounded-pill px-4 d-none d-md-block">
              View All →
            </Link>
          </div>
          <div className="row g-3">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="col-6 col-md-4 col-lg-3">
                <ProductCard product={product as never} index={index} />
              </div>
            ))}
          </div>
          <div className="text-center mt-4 d-md-none">
            <Link href="/products" className="btn btn-outline-primary rounded-pill px-4">
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #e94560 0%, #c62a47 100%)',
          padding: '4rem 0',
        }}
      >
        <div className="container text-center text-white">
          <p style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.8 }}>
            Limited Time Offer
          </p>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '0.75rem' }}>
            Up to 30% Off
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
            On selected electronics and fashion items. Use code <strong>AARDRA30</strong> at checkout.
          </p>
          <Link href="/products" className="btn btn-light btn-lg rounded-pill px-5" style={{ color: '#e94560', fontWeight: 700 }}>
            Shop the Sale
          </Link>
        </div>
      </section>

      <TrustBadges />
    </>
  );
}

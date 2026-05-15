'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.div variants={item} className="hero-section__eyebrow">
                ✦ New Collection 2025
              </motion.div>
              <motion.h1 variants={item} className="hero-section__title">
                Shop the <span>Future</span> of Fashion
              </motion.h1>
              <motion.p variants={item} className="hero-section__subtitle">
                Discover premium curated collections across electronics, fashion, and home décor.
                Elevate your lifestyle with Aardra.
              </motion.p>
              <motion.div variants={item} className="d-flex gap-3 flex-wrap">
                <Link href="/products" className="btn btn-accent btn-lg rounded-pill px-5">
                  Shop Now →
                </Link>
                <Link href="/products?category=electronics" className="btn btn-outline-light btn-lg rounded-pill px-4">
                  Explore Electronics
                </Link>
              </motion.div>
              <motion.div variants={item} className="hero-section__stats">
                {[
                  { value: '10K+', label: 'Products' },
                  { value: '50K+', label: 'Customers' },
                  { value: '4.9★', label: 'Rating' },
                ].map((s) => (
                  <div key={s.label} className="stat">
                    <div className="value">{s.value}</div>
                    <div className="label">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <div className="col-lg-6 d-none d-lg-block">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="hero-section__image"
            >
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
                alt="Premium shopping at Aardra"
                width={600}
                height={600}
                priority
                style={{ borderRadius: 16, width: '100%', height: 'auto' }}
              />
              {/* Floating product card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                style={{
                  position: 'absolute',
                  bottom: 32,
                  left: -24,
                  background: '#fff',
                  borderRadius: 12,
                  padding: '12px 16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  maxWidth: 220,
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>🎧</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1a1a2e' }}>Wireless Headphones</div>
                  <div style={{ color: '#e94560', fontWeight: 700, fontSize: '0.875rem' }}>$299.99</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-3"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ fontSize: '5rem', marginBottom: '1rem' }}
        >
          🔍
        </motion.div>
        <h1 style={{ fontSize: '5rem', fontWeight: 900, color: '#1a1a2e', lineHeight: 1 }}>404</h1>
        <h2 className="fw-bold mb-2" style={{ color: '#1a1a2e' }}>Page Not Found</h2>
        <p className="text-muted mb-4" style={{ maxWidth: 400, margin: '0 auto 1.5rem' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link href="/" className="btn btn-accent rounded-pill px-5">
            Go Home
          </Link>
          <Link href="/products" className="btn btn-outline-secondary rounded-pill px-5">
            Browse Products
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

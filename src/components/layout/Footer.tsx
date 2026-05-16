'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="mb-3">
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                Aard<span style={{ color: '#e94560' }}>ra</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>
              Premium e-commerce destination for curated fashion, electronics, and home décor.
              Shop with confidence, delivered with care.
            </p>
            <div className="d-flex gap-3 mt-3">
              {['𝕏', 'f', 'in', '◉'].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="d-flex align-items-center justify-content-center text-decoration-none"
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s',
                  }}
                  aria-label={`Social link ${i + 1}`}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6>Shop</h6>
            <ul className="list-unstyled mb-0">
              {[
                { label: 'All Products', href: '/products' },
                { label: 'Electronics', href: '/products?category=electronics' },
                { label: 'Clothing', href: '/products?category=clothing' },
                { label: 'Home & Decor', href: '/products?category=home-decor' },
                { label: 'New Arrivals', href: '/products?sort=newest' },
              ].map((link) => (
                <li key={link.label} className="mb-2">
                  <Link href={link.href} style={{ fontSize: '0.875rem' }}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6>Account</h6>
            <ul className="list-unstyled mb-0">
              {[
                { label: 'My Account', href: '/account' },
                { label: 'Order History', href: '/account' },
                { label: 'Sign In', href: '/auth/login' },
                { label: 'Register', href: '/auth/register' },
                { label: 'Cart', href: '/cart' },
              ].map((link) => (
                <li key={link.label} className="mb-2">
                  <Link href={link.href} style={{ fontSize: '0.875rem' }}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6>Newsletter</h6>
            <p style={{ fontSize: '0.875rem' }}>
              Subscribe for exclusive deals, new arrivals and style inspiration.
            </p>
            <form className="newsletter-input" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email address" aria-label="Email for newsletter" />
              <button type="submit">Subscribe</button>
            </form>
            <div className="mt-3">
              <h6 className="mt-3">Contact</h6>
              <p style={{ fontSize: '0.8rem' }}>
                📧 hello@aardra.com<br />
                📞 +1 (555) 123-4567<br />
                📍 123 Commerce St, NY 10001
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Aardra. All rights reserved.</span>
          <div className="d-flex gap-3">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

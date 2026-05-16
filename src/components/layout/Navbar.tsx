'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import MiniCart from './MiniCart';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.getItemCount());
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <>
      <nav className={`navbar navbar-aardra navbar-expand-lg fixed-top ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <Link href="/" className="navbar-brand">
            Aard<span>ra</span>
          </Link>

          <button
            className="navbar-toggler border-0 p-0 me-3"
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.svg key="close" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                </motion.svg>
              ) : (
                <motion.svg key="open" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>

          {/* Cart + Auth always visible on mobile (top bar) */}
          <div className="d-flex d-lg-none align-items-center gap-2 ms-auto me-2">
            <button
              className="cart-btn d-flex align-items-center gap-1"
              onClick={() => { setCartOpen(true); setMobileOpen(false); }}
              aria-label={`Cart (${itemCount} items)`}
              style={{ fontSize: '1rem' }}
            >
              🛒
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span key={itemCount} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="cart-count">
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            {session ? (
              <button
                className="user-btn"
                onClick={() => setMobileOpen((o) => !o)}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                aria-label="Menu"
              >
                {session.user.name?.split(' ')[0]} ▾
              </button>
            ) : (
              <Link href="/auth/login" className="user-btn text-decoration-none" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            )}
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                className="d-lg-none w-100"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden', order: 3 }}
              >
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8, paddingBottom: 8 }}>
                  {/* Search */}
                  <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }} className="nav-search mx-2 mb-2">
                    <span className="search-icon">🔍</span>
                    <input type="search" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
                  </form>

                  {/* Nav links */}
                  <ul className="navbar-nav mb-1">
                    {[
                      { label: 'Home', href: '/' },
                      { label: 'Products', href: '/products' },
                      { label: 'Electronics', href: '/products?category=electronics' },
                      { label: 'Clothing', href: '/products?category=clothing' },
                    ].map((item) => (
                      <li key={item.href} className="nav-item">
                        <Link href={item.href} className="nav-link py-2" onClick={() => setMobileOpen(false)}>{item.label}</Link>
                      </li>
                    ))}
                  </ul>

                  {/* Account section */}
                  {session && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8, marginTop: 4 }}>
                      <Link href="/account" className="nav-link py-2" onClick={() => setMobileOpen(false)}>👤 My Account</Link>
                      <Link href="/account" className="nav-link py-2" onClick={() => setMobileOpen(false)}>📦 Orders</Link>
                      {session.user.role === 'ADMIN' && (
                        <Link href="/admin" className="nav-link py-2" onClick={() => setMobileOpen(false)}>⚙️ Admin</Link>
                      )}
                      <button
                        className="nav-link py-2 border-0 bg-transparent w-100 text-start"
                        style={{ color: '#e94560', cursor: 'pointer' }}
                        onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false); }}
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="collapse navbar-collapse" id="navMain">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link href="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <Link href="/products" className="nav-link">Products</Link>
              </li>
              <li className="nav-item">
                <Link href="/products?category=electronics" className="nav-link">Electronics</Link>
              </li>
              <li className="nav-item">
                <Link href="/products?category=clothing" className="nav-link">Clothing</Link>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3">
              <form onSubmit={handleSearch} className="nav-search d-none d-lg-block">
                <span className="search-icon">🔍</span>
                <input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search products"
                />
              </form>

              <button
                className="cart-btn d-flex align-items-center gap-2"
                onClick={() => setCartOpen(true)}
                aria-label={`Cart (${itemCount} items)`}
              >
                🛒
                <span className="d-none d-sm-inline" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cart</span>
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="cart-count"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {session ? (
                <div className="position-relative" ref={userMenuRef}>
                  <button
                    className="user-btn"
                    onClick={() => setUserMenuOpen((o) => !o)}
                    aria-expanded={userMenuOpen}
                    aria-label="User menu"
                  >
                    {session.user.name?.split(' ')[0]} ▾
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        className="position-absolute end-0 mt-2 py-2 bg-white rounded-3 shadow-lg"
                        style={{ minWidth: 180, zIndex: 1050, border: '1px solid #f0f0f0' }}
                      >
                        <Link
                          href="/account"
                          className="dropdown-item py-2 px-3 text-dark text-decoration-none d-block"
                          style={{ fontSize: '0.875rem' }}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          👤 My Account
                        </Link>
                        <Link
                          href="/account"
                          className="dropdown-item py-2 px-3 text-dark text-decoration-none d-block"
                          style={{ fontSize: '0.875rem' }}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          📦 Orders
                        </Link>
                        {session.user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            className="dropdown-item py-2 px-3 text-dark text-decoration-none d-block"
                            style={{ fontSize: '0.875rem' }}
                            onClick={() => setUserMenuOpen(false)}
                          >
                            ⚙️ Admin
                          </Link>
                        )}
                        <hr className="my-1" />
                        <button
                          className="dropdown-item py-2 px-3 text-danger border-0 bg-transparent w-100 text-start"
                          style={{ fontSize: '0.875rem' }}
                          onClick={() => signOut({ callbackUrl: '/' })}
                        >
                          🚪 Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/auth/login" className="user-btn text-decoration-none">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <MiniCart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

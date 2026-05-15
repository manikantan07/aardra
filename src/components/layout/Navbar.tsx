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
            data-bs-toggle="collapse"
            data-bs-target="#navMain"
            aria-controls="navMain"
            aria-label="Toggle navigation"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
            </svg>
          </button>

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

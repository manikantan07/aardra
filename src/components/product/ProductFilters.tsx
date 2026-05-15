'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Category } from '@/types';

interface Props {
  categories: Category[];
}

export default function ProductFilters({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentCategory = searchParams.get('category') ?? '';
  const currentSort = searchParams.get('sort') ?? 'newest';
  const inStock = searchParams.get('inStock') === '1';
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice') ?? 2000));

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) params.delete(key);
      else params.set(key, value);
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const filtersContent = (
    <div className="filter-panel">
      <div className="filter-section">
        <h6>Sort By</h6>
        <select
          className="form-select form-select-sm"
          value={currentSort}
          onChange={(e) => updateParam('sort', e.target.value)}
          aria-label="Sort products"
        >
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="featured">Featured</option>
        </select>
      </div>

      <div className="filter-section">
        <h6>Category</h6>
        <div className="form-check mb-1">
          <input
            className="form-check-input"
            type="radio"
            id="cat-all"
            name="category"
            checked={currentCategory === ''}
            onChange={() => updateParam('category', null)}
          />
          <label className="form-check-label" htmlFor="cat-all">All Categories</label>
        </div>
        {categories.map((cat) => (
          <div key={cat.id} className="form-check mb-1">
            <input
              className="form-check-input"
              type="radio"
              id={`cat-${cat.slug}`}
              name="category"
              checked={currentCategory === cat.slug}
              onChange={() => updateParam('category', cat.slug)}
            />
            <label className="form-check-label" htmlFor={`cat-${cat.slug}`}>
              {cat.name}
            </label>
          </div>
        ))}
      </div>

      <div className="filter-section">
        <h6>Max Price</h6>
        <div className="price-range">
          <input
            type="range"
            className="form-range"
            min={0}
            max={2000}
            step={10}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            onMouseUp={() => updateParam('maxPrice', String(maxPrice))}
            onTouchEnd={() => updateParam('maxPrice', String(maxPrice))}
            aria-label="Max price filter"
          />
          <div className="range-values">
            <span>$0</span>
            <span>${maxPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h6>Availability</h6>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="in-stock"
            checked={inStock}
            onChange={(e) => updateParam('inStock', e.target.checked ? '1' : null)}
            role="switch"
          />
          <label className="form-check-label" htmlFor="in-stock" style={{ fontSize: '0.875rem' }}>
            In Stock Only
          </label>
        </div>
      </div>

      {(currentCategory || inStock || searchParams.get('maxPrice')) && (
        <div className="filter-section">
          <button
            className="btn btn-outline-danger btn-sm w-100 rounded-pill"
            onClick={() => router.push(pathname)}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="d-lg-none mb-3">
        <button
          className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center gap-2"
          onClick={() => setMobileOpen(true)}
          aria-label="Open filters"
        >
          ⚙ Filters & Sort
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="d-none d-lg-block">{filtersContent}</div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1044 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="position-fixed top-0 start-0 h-100 bg-white filter-drawer"
              style={{ width: 300, zIndex: 1045, overflowY: 'auto' }}
            >
              <div className="offcanvas-header">
                <span className="offcanvas-title">Filters</span>
                <button className="btn-close btn-close-white" onClick={() => setMobileOpen(false)} aria-label="Close filters" />
              </div>
              <div className="p-3">{filtersContent}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

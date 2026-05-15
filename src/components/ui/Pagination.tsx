'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface Props {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
  );

  return (
    <nav aria-label="Product pagination" className="d-flex justify-content-center mt-4">
      <ul className="pagination gap-1">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => goTo(currentPage - 1)} aria-label="Previous">
            ‹
          </button>
        </li>

        {visiblePages.map((page, idx) => {
          const prev = visiblePages[idx - 1];
          const showEllipsis = prev && page - prev > 1;
          return (
            <span key={page} className="d-contents">
              {showEllipsis && (
                <li className="page-item disabled">
                  <span className="page-link border-0 bg-transparent">…</span>
                </li>
              )}
              <li className={`page-item ${page === currentPage ? 'active' : ''}`}>
                <button className="page-link" onClick={() => goTo(page)}>
                  {page}
                </button>
              </li>
            </span>
          );
        })}

        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => goTo(currentPage + 1)} aria-label="Next">
            ›
          </button>
        </li>
      </ul>
    </nav>
  );
}

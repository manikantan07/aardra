export default function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton">
      <div className="skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton-line short" />
        <div className="skeleton-line medium" />
        <div className="skeleton-line full" />
        <div className="skeleton-line price" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="row g-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-6 col-md-4 col-lg-3">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}

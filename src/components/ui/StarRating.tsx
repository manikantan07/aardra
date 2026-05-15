interface Props {
  score: number;
  count?: number;
  size?: 'sm' | 'md';
}

export default function StarRating({ score, count, size = 'sm' }: Props) {
  const fontSize = size === 'md' ? '1rem' : '0.8rem';

  return (
    <div className="d-flex align-items-center gap-1">
      <div className="star-rating d-inline-flex" style={{ fontSize }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= Math.floor(score) ? 'filled' : star - 0.5 <= score ? 'half' : ''}`}
          >
            {star <= Math.floor(score) ? '★' : star - 0.5 <= score ? '★' : '☆'}
          </span>
        ))}
      </div>
      {count !== undefined && (
        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
          ({count})
        </span>
      )}
    </div>
  );
}

interface Props {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  text?: string;
}

export default function LoadingSpinner({ size = 'md', fullPage = false, text }: Props) {
  const spinnerSize = size === 'sm' ? 'spinner-border-sm' : size === 'lg' ? '' : '';

  const spinner = (
    <div className="text-center">
      <div
        className={`spinner-border text-accent ${spinnerSize}`}
        role="status"
        style={size === 'lg' ? { width: '3rem', height: '3rem', borderWidth: '0.3em' } : {}}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-3 text-muted small">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '60vh' }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}

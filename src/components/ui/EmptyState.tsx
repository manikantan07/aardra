'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Props {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon = '📭', title, description, actionLabel, actionHref, onAction }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-5"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="display-1 mb-3"
        style={{ fontSize: '4rem' }}
      >
        {icon}
      </motion.div>
      <h4 className="fw-bold text-dark mb-2">{title}</h4>
      {description && <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 360 }}>{description}</p>}
      {actionLabel && (
        <>
          {actionHref ? (
            <Link href={actionHref} className="btn btn-accent rounded-pill px-4">
              {actionLabel}
            </Link>
          ) : (
            <button onClick={onAction} className="btn btn-accent rounded-pill px-4">
              {actionLabel}
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}

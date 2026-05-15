'use client';

import { motion } from 'framer-motion';
import type { Variant } from '@/types';

interface Props {
  variants: Variant[];
  selected: Record<string, string>;
  onChange: (variantName: string, option: string) => void;
}

const colorMap: Record<string, string> = {
  'midnight black': '#1a1a1a',
  'pearl white': '#f5f5f0',
  'rose gold': '#b76e79',
  'space gray': '#6e7070',
  silver: '#c0c0c0',
  gold: '#ffd700',
  'matte black': '#2b2b2b',
  chrome: '#dde5ed',
  red: '#ef4444',
  blue: '#3b82f6',
  white: '#ffffff',
  black: '#1a1a1a',
  tan: '#c8a882',
  ivory: '#fffff0',
  camel: '#c19a6b',
  navy: '#001f5b',
  charcoal: '#36454f',
  khaki: '#c3b091',
  olive: '#808000',
  stone: '#928e85',
  terracotta: '#e2725b',
  sage: '#87ae73',
  cream: '#fffdd0',
  'dusty rose': '#dcae96',
  'slate blue': '#6a7f9a',
  'warm gray': '#9b9b9b',
  natural: '#f5deb3',
};

export default function ProductVariants({ variants, selected, onChange }: Props) {
  if (!variants.length) return null;

  return (
    <div className="product-detail__variants">
      {variants.map((variant) => {
        const isColor = variant.name.toLowerCase().includes('color') || variant.name.toLowerCase() === 'finish';
        const isSize = variant.name.toLowerCase().includes('size') || variant.name.toLowerCase() === 'waist';

        return (
          <div key={variant.id} className="mb-3">
            <div className="variant-label">
              {variant.name}
              {selected[variant.name] && (
                <span className="fw-normal text-muted ms-1">— {selected[variant.name]}</span>
              )}
            </div>
            <div className="variant-options">
              {variant.options.map((option) => {
                const isSelected = selected[variant.name] === option;
                const colorHex = colorMap[option.toLowerCase()];

                if (isColor && colorHex) {
                  return (
                    <motion.button
                      key={option}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onChange(variant.name, option)}
                      title={option}
                      aria-label={`${variant.name}: ${option}`}
                      aria-pressed={isSelected}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: colorHex,
                        border: isSelected ? '3px solid #1a1a2e' : '2px solid #ddd',
                        cursor: 'pointer',
                        outline: isSelected ? '2px solid #e94560' : 'none',
                        outlineOffset: 2,
                        transition: 'all 0.18s ease',
                      }}
                    />
                  );
                }

                return (
                  <motion.button
                    key={option}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onChange(variant.name, option)}
                    className={`variant-option ${isSelected ? 'selected' : ''}`}
                    aria-pressed={isSelected}
                    style={{ minWidth: isSize ? 44 : undefined, textAlign: 'center' }}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

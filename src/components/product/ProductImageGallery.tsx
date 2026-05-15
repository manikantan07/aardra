'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  images: string[];
  name: string;
}

export default function ProductImageGallery({ images, name }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  return (
    <div className="product-detail__image-area">
      <div
        className="product-detail__image-main position-relative overflow-hidden"
        style={{ borderRadius: 12, background: '#f5f5f5', aspectRatio: '1/1' }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="position-absolute inset-0 w-100 h-100"
          >
            <Image
              src={images[activeIndex] ?? 'https://via.placeholder.com/600'}
              alt={`${name} - image ${activeIndex + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={activeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              className="position-absolute start-0 top-50 translate-middle-y ms-2 btn btn-sm rounded-circle"
              style={{ background: 'rgba(255,255,255,0.9)', width: 36, height: 36, padding: 0, border: 'none', zIndex: 2 }}
              onClick={() => goTo((activeIndex - 1 + images.length) % images.length)}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className="position-absolute end-0 top-50 translate-middle-y me-2 btn btn-sm rounded-circle"
              style={{ background: 'rgba(255,255,255,0.9)', width: 36, height: 36, padding: 0, border: 'none', zIndex: 2 }}
              onClick={() => goTo((activeIndex + 1) % images.length)}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="product-detail__thumbnails">
          {images.map((img, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goTo(i)}
              className={`thumb border-0 p-0 bg-transparent ${i === activeIndex ? 'active' : ''}`}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === activeIndex}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${i + 1}`}
                width={72}
                height={72}
                style={{ objectFit: 'cover' }}
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

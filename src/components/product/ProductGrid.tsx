import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface Props {
  products: Product[];
}

export default function ProductGrid({ products }: Props) {
  return (
    <div className="row g-3">
      {products.map((product, index) => (
        <div key={product.id} className="col-6 col-md-4 col-xl-4">
          <ProductCard product={product} index={index} />
        </div>
      ))}
    </div>
  );
}

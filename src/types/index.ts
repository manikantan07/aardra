export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
}

export interface Variant {
  id: string;
  productId: string;
  name: string;
  options: string[];
}

export interface Rating {
  id: string;
  productId: string;
  userId: string;
  score: number;
  comment?: string | null;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  categoryId: string;
  category: Category;
  stock: number;
  sku?: string | null;
  featured: boolean;
  isActive: boolean;
  variants: Variant[];
  ratings: Rating[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartStoreItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: Record<string, string>;
  stock: number;
}

export interface CartState {
  items: CartStoreItem[];
  addItem: (item: CartStoreItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getShipping: () => number;
  getGrandTotal: () => number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  variant?: Record<string, string> | null;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  stripeSessionId?: string | null;
  shippingAddress: ShippingAddress;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'featured';
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

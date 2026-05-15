export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function calculateDiscount(price: number, comparePrice: number): number {
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export function getAverageRating(ratings: { score: number }[]): number {
  if (!ratings.length) return 0;
  return ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const TAX_RATE = 0.08;
export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_COST = 9.99;
export const ITEMS_PER_PAGE = 12;

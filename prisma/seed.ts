import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@aardra.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@aardra.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@aardra.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@aardra.com',
      password: await bcrypt.hash('User123!', 12),
      role: 'USER',
    },
  });

  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets and technology',
      imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
    },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Premium fashion and apparel',
      imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600',
    },
  });

  const homeDecor = await prisma.category.upsert({
    where: { slug: 'home-decor' },
    update: {},
    create: {
      name: 'Home & Decor',
      slug: 'home-decor',
      description: 'Beautiful home accessories',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
    },
  });

  const products = [
    {
      name: 'Premium Wireless Headphones',
      slug: 'premium-wireless-headphones',
      description: 'Experience crystal-clear audio with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and premium leather ear cushions for all-day comfort.',
      price: 299.99,
      comparePrice: 399.99,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
        'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800',
      ],
      categoryId: electronics.id,
      stock: 45,
      sku: 'ELEC-001',
      featured: true,
      variants: [
        { name: 'Color', options: ['Midnight Black', 'Pearl White', 'Rose Gold'] },
      ],
    },
    {
      name: 'Smart Watch Pro Series',
      slug: 'smart-watch-pro-series',
      description: 'Track your fitness, receive notifications, and pay on the go with this premium smartwatch. Features GPS, heart rate monitor, sleep tracking, and 5-day battery life.',
      price: 449.99,
      comparePrice: 549.99,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
      ],
      categoryId: electronics.id,
      stock: 28,
      sku: 'ELEC-002',
      featured: true,
      variants: [
        { name: 'Size', options: ['40mm', '44mm'] },
        { name: 'Color', options: ['Space Gray', 'Silver', 'Gold'] },
      ],
    },
    {
      name: 'Ultra-Slim Laptop 14"',
      slug: 'ultra-slim-laptop-14',
      description: 'Power meets portability. This ultra-slim laptop features a stunning OLED display, latest-gen processor, 16GB RAM, and all-day battery life in a feather-light 1.2kg chassis.',
      price: 1299.99,
      comparePrice: 1499.99,
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
      ],
      categoryId: electronics.id,
      stock: 12,
      sku: 'ELEC-003',
      featured: true,
      variants: [
        { name: 'Storage', options: ['256GB', '512GB', '1TB'] },
        { name: 'RAM', options: ['8GB', '16GB', '32GB'] },
      ],
    },
    {
      name: 'Luxury Cashmere Sweater',
      slug: 'luxury-cashmere-sweater',
      description: 'Indulge in the unparalleled softness of 100% pure Mongolian cashmere. This timeless crew-neck sweater is crafted with meticulous attention to detail for lasting comfort and style.',
      price: 189.99,
      comparePrice: 249.99,
      images: [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
      ],
      categoryId: clothing.id,
      stock: 35,
      sku: 'CLTH-001',
      featured: true,
      variants: [
        { name: 'Size', options: ['XS', 'S', 'M', 'L', 'XL'] },
        { name: 'Color', options: ['Ivory', 'Camel', 'Navy', 'Charcoal'] },
      ],
    },
    {
      name: 'Designer Slim-Fit Chinos',
      slug: 'designer-slim-fit-chinos',
      description: 'Crafted from premium stretch cotton, these slim-fit chinos offer both style and comfort. Perfect for the office or weekend adventures.',
      price: 89.99,
      comparePrice: 119.99,
      images: [
        'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
      ],
      categoryId: clothing.id,
      stock: 60,
      sku: 'CLTH-002',
      featured: false,
      variants: [
        { name: 'Waist', options: ['28', '30', '32', '34', '36'] },
        { name: 'Color', options: ['Khaki', 'Navy', 'Olive', 'Stone'] },
      ],
    },
    {
      name: 'Premium Leather Sneakers',
      slug: 'premium-leather-sneakers',
      description: 'Handcrafted from full-grain Italian leather, these minimalist sneakers blend timeless style with modern comfort. Features cushioned insoles and durable rubber outsoles.',
      price: 149.99,
      comparePrice: 199.99,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
      ],
      categoryId: clothing.id,
      stock: 40,
      sku: 'CLTH-003',
      featured: true,
      variants: [
        { name: 'Size', options: ['7', '8', '9', '10', '11', '12'] },
        { name: 'Color', options: ['White', 'Black', 'Tan'] },
      ],
    },
    {
      name: 'Artisan Ceramic Vase Set',
      slug: 'artisan-ceramic-vase-set',
      description: 'Elevate your home with this handcrafted set of three ceramic vases. Each piece is uniquely shaped and glazed by skilled artisans, making them truly one-of-a-kind home accents.',
      price: 79.99,
      comparePrice: 99.99,
      images: [
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800',
        'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800',
      ],
      categoryId: homeDecor.id,
      stock: 25,
      sku: 'HOME-001',
      featured: false,
      variants: [
        { name: 'Color', options: ['Terracotta', 'Sage', 'Cream'] },
      ],
    },
    {
      name: 'Minimalist Table Lamp',
      slug: 'minimalist-table-lamp',
      description: 'A sculptural masterpiece that doubles as functional lighting. This adjustable table lamp features a brass finish, linen shade, and touch-dimmer for the perfect ambiance.',
      price: 129.99,
      comparePrice: 159.99,
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
        'https://images.unsplash.com/photo-1513506003901-1e6a35068527?w=800',
      ],
      categoryId: homeDecor.id,
      stock: 18,
      sku: 'HOME-002',
      featured: false,
      variants: [
        { name: 'Finish', options: ['Brass', 'Matte Black', 'Chrome'] },
      ],
    },
    {
      name: 'Linen Throw Blanket',
      slug: 'linen-throw-blanket',
      description: 'Wrap yourself in luxury with this ultra-soft linen throw blanket. Pre-washed for immediate softness, it gets better with every wash and adds a cozy touch to any room.',
      price: 64.99,
      comparePrice: 84.99,
      images: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
      ],
      categoryId: homeDecor.id,
      stock: 50,
      sku: 'HOME-003',
      featured: false,
      variants: [
        { name: 'Color', options: ['Natural', 'Dusty Rose', 'Slate Blue', 'Warm Gray'] },
      ],
    },
    {
      name: 'Wireless Charging Pad Pro',
      slug: 'wireless-charging-pad-pro',
      description: 'Charge multiple devices simultaneously with this sleek 15W fast wireless charging pad. Compatible with all Qi-enabled devices. Features LED indicators and anti-slip base.',
      price: 49.99,
      comparePrice: 69.99,
      images: [
        'https://images.unsplash.com/photo-1603539947678-cd3954ed515d?w=800',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
      ],
      categoryId: electronics.id,
      stock: 75,
      sku: 'ELEC-004',
      featured: false,
      variants: [
        { name: 'Color', options: ['Black', 'White'] },
      ],
    },
    {
      name: 'Premium Silk Dress Shirt',
      slug: 'premium-silk-dress-shirt',
      description: 'Elevate your formal wardrobe with this premium silk-blend dress shirt. Features a slim fit, French cuffs, and mother-of-pearl buttons for a refined, polished look.',
      price: 119.99,
      comparePrice: 159.99,
      images: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4b5bdf?w=800',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800',
      ],
      categoryId: clothing.id,
      stock: 30,
      sku: 'CLTH-004',
      featured: false,
      variants: [
        { name: 'Size', options: ['S', 'M', 'L', 'XL', 'XXL'] },
        { name: 'Color', options: ['White', 'Light Blue', 'Pale Pink'] },
      ],
    },
    {
      name: 'Scented Soy Candle Collection',
      slug: 'scented-soy-candle-collection',
      description: 'Transform your space with our handpoured collection of luxury soy candles. Each candle burns for 60+ hours and fills your home with a sophisticated, long-lasting fragrance.',
      price: 44.99,
      comparePrice: 59.99,
      images: [
        'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800',
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800',
      ],
      categoryId: homeDecor.id,
      stock: 80,
      sku: 'HOME-004',
      featured: true,
      variants: [
        { name: 'Scent', options: ['Cedar & Sage', 'Vanilla & Amber', 'Ocean Breeze', 'Rose & Oud'] },
      ],
    },
  ];

  for (const product of products) {
    const { variants, ...productData } = product;
    const existing = await prisma.product.findUnique({ where: { slug: productData.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          ...productData,
          variants: {
            create: variants,
          },
        },
      });
    }
  }

  console.log('✅ Database seeded successfully');
  console.log('👤 Admin: admin@aardra.com / Admin123!');
  console.log('👤 User:  user@aardra.com  / User123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

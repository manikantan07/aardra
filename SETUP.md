# Aardra — Setup Guide

A full-stack premium e-commerce app built with Next.js 15, Bootstrap 5, Prisma, PostgreSQL, Stripe, and Framer Motion.

---

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally (or Neon/Supabase for cloud)
- A Stripe account (test mode)

---

## 1. Install Dependencies

```bash
cd aardra-frontend
npm install
```

---

## 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/aardra_db"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 3. Database Setup

Create the database (if it doesn't exist):

```bash
createdb aardra_db
```

Run migrations:

```bash
npm run prisma:push
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Seed with demo data (categories, products, admin user):

```bash
npm run prisma:seed
```

**Demo accounts after seeding:**
- Admin: `admin@aardra.com` / `Admin123!`
- User: `user@aardra.com` / `User123!`

---

## 4. Stripe Webhook (local development)

Install Stripe CLI: https://stripe.com/docs/stripe-cli

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook secret it shows and paste it into `STRIPE_WEBHOOK_SECRET` in your `.env`.

---

## 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Pages

| URL | Description |
|-----|-------------|
| `/` | Home — hero, categories, featured products |
| `/products` | Product listing with filters, search, sort, pagination |
| `/products/[id]` | Product detail — gallery, variants, add to cart |
| `/cart` | Shopping cart |
| `/checkout` | Checkout form + Stripe redirect |
| `/order-success` | Post-payment success page |
| `/auth/login` | Sign in |
| `/auth/register` | Create account |
| `/account` | Order history |
| `/admin` | Admin dashboard |
| `/admin/products` | Product CRUD |
| `/admin/orders` | Order management |

---

## Prisma Studio (database UI)

```bash
npm run prisma:studio
```

Open [http://localhost:5555](http://localhost:5555)

---

## Deploy to Vercel

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Set all environment variables in Vercel dashboard
4. For `DATABASE_URL`, use a cloud Postgres (Neon or Supabase — both have free tiers)
5. Set `NEXTAUTH_URL` to your production domain
6. Deploy

After deploying, add your Vercel URL to Stripe webhook endpoints:
```
https://your-domain.vercel.app/api/stripe/webhook
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Bootstrap 5 + SCSS |
| Animations | Framer Motion |
| Auth | NextAuth.js (Credentials + JWT) |
| ORM | Prisma |
| Database | PostgreSQL |
| Payments | Stripe Checkout |
| State | Zustand (persist to localStorage) |
| Toasts | react-hot-toast |

---

## Folder Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── admin/        # Admin dashboard
│   ├── api/          # API routes
│   ├── auth/         # Login / Register
│   ├── cart/         # Cart page
│   ├── checkout/     # Checkout page
│   └── products/     # Product listing + detail
├── actions/          # Server Actions
├── components/
│   ├── admin/        # Admin-specific components
│   ├── cart/         # Cart components
│   ├── checkout/     # Checkout form
│   ├── home/         # Home page sections
│   ├── layout/       # Navbar, Footer, MiniCart
│   ├── product/      # Product card, grid, filters
│   └── ui/           # Shared UI components
├── lib/              # Prisma, Stripe, auth, utils
├── store/            # Zustand cart store
├── styles/           # SCSS partials
└── types/            # TypeScript interfaces
```

# E-Commerce Store

A modern e-commerce store built with Next.js 13, TypeScript, and TailwindCSS.

## Features

- Home page with featured products
- Shop page with all products
- Individual product pages
- Shopping cart
- Checkout flow
- Admin dashboard
- Supabase integration ready

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                  # Next.js 13 app directory
│   ├── page.tsx         # Home page
│   ├── shop/            # Shop page
│   ├── product/[id]/    # Product detail pages
│   ├── cart/            # Shopping cart
│   ├── checkout/        # Checkout page
│   └── admin/           # Admin dashboard
├── components/          # Reusable components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ProductCard.tsx
├── lib/                 # Utilities and data
│   ├── supabase.ts     # Supabase client
│   └── data.ts         # Placeholder product data
└── public/             # Static assets
```

## Deployment

Deploy to Vercel:

```bash
npm run build
```

The project is ready for deployment on Vercel, Netlify, or any platform supporting Next.js.

## Technologies

- Next.js 14
- TypeScript
- TailwindCSS
- Supabase

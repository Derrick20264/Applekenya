# Admin Dashboard Setup Guide

## Features

The admin dashboard includes:

- Dashboard overview with statistics
- Product management (Add, Edit, Delete)
- Order management with status updates
- Image upload functionality
- Responsive design with TailwindCSS

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

### 2. Set Up Database

Run the SQL commands in `lib/supabase-schema.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard > SQL Editor
2. Copy and paste the contents of `lib/supabase-schema.sql`
3. Click "Run" to execute

This will create:
- `products` table
- `categories` table
- `orders` table
- Sample data
- Indexes for performance
- Row Level Security policies

### 3. Set Up Storage

1. Go to Supabase Dashboard > Storage
2. Create a new bucket called `product-images`
3. Set it to "Public" access
4. Configure CORS if needed

### 4. Environment Variables

Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Admin Routes

- `/admin` - Dashboard overview
- `/admin/products` - Product management
- `/admin/orders` - Order management

## CRUD Operations

All Supabase operations are in `lib/supabase-functions.ts`:

### Products
- `getProducts()` - Fetch all products
- `getProductById(id)` - Fetch single product
- `createProduct(product)` - Create new product
- `updateProduct(id, updates)` - Update product
- `deleteProduct(id)` - Delete product
- `uploadProductImage(file)` - Upload product image

### Orders
- `getOrders()` - Fetch all orders
- `getOrderById(id)` - Fetch single order
- `createOrder(order)` - Create new order
- `updateOrderStatus(id, status)` - Update order status

### Analytics
- `getDashboardStats()` - Get dashboard statistics

## Product Form Fields

- Name (required)
- Brand (required)
- Price (required, decimal)
- Stock (required, integer)
- Category (required, dropdown)
- Description (required, textarea)
- Image Upload (optional, file input)

## Order Statuses

- Pending
- Processing
- Shipped
- Delivered
- Cancelled

## Development

```bash
npm install
npm run dev
```

## Production Deployment

The admin dashboard is ready for deployment on Vercel or any Next.js hosting platform. Make sure to:

1. Set environment variables in your hosting platform
2. Configure Supabase RLS policies for production
3. Set up authentication for admin access (recommended)

## Security Notes

Currently, the admin dashboard has no authentication. For production:

1. Implement authentication (Supabase Auth, NextAuth, etc.)
2. Update RLS policies to restrict admin operations
3. Add middleware to protect admin routes
4. Validate user roles before allowing CRUD operations

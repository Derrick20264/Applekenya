-- ==================== PRODUCTS TABLE ====================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);

-- ==================== CATEGORIES TABLE ====================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== ORDERS TABLE ====================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  shipping_address TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster order queries
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);

-- ==================== STORAGE BUCKET FOR IMAGES ====================
-- Run this in Supabase Dashboard > Storage
-- Create a new bucket called 'product-images' with public access

-- ==================== ROW LEVEL SECURITY (RLS) ====================
-- Enable RLS on tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public read access for products and categories
CREATE POLICY "Public read access for products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Public read access for categories"
  ON categories FOR SELECT
  USING (true);

-- Admin-only write access (you'll need to set up authentication)
-- For now, allow all operations for development
CREATE POLICY "Allow all operations on products"
  ON products FOR ALL
  USING (true);

CREATE POLICY "Allow all operations on categories"
  ON categories FOR ALL
  USING (true);

CREATE POLICY "Allow all operations on orders"
  ON orders FOR ALL
  USING (true);

-- ==================== SAMPLE DATA ====================
INSERT INTO categories (name, slug, description) VALUES
  ('Phones', 'phones', 'Smartphones and mobile devices'),
  ('Tablets', 'tablets', 'Tablets and iPads'),
  ('Laptops', 'laptops', 'Laptops and notebooks'),
  ('Accessories', 'accessories', 'Phone and computer accessories'),
  ('Audio', 'audio', 'Headphones, earbuds, and speakers'),
  ('Wearables', 'wearables', 'Smartwatches and fitness trackers');

INSERT INTO products (name, brand, price, stock, category, description) VALUES
  ('iPhone 15 Pro', 'Apple', 999.00, 50, 'phones', 'Latest iPhone with A17 Pro chip and titanium design'),
  ('Samsung Galaxy S24', 'Samsung', 899.00, 45, 'phones', 'Flagship Android phone with AI features'),
  ('Google Pixel 8 Pro', 'Google', 899.00, 30, 'phones', 'Pure Android experience with excellent camera'),
  ('iPad Pro 12.9"', 'Apple', 1099.00, 30, 'tablets', 'Powerful tablet with M2 chip'),
  ('Samsung Galaxy Tab S9', 'Samsung', 799.00, 25, 'tablets', 'Premium Android tablet with S Pen'),
  ('MacBook Pro 14"', 'Apple', 1999.00, 20, 'laptops', 'Professional laptop with M3 chip'),
  ('Dell XPS 15', 'Dell', 1799.00, 15, 'laptops', 'Premium Windows laptop'),
  ('AirPods Pro', 'Apple', 249.00, 100, 'accessories', 'Wireless earbuds with active noise cancellation'),
  ('Sony WH-1000XM5', 'Sony', 399.00, 60, 'audio', 'Premium noise-cancelling headphones'),
  ('Apple Watch Series 9', 'Apple', 399.00, 40, 'wearables', 'Advanced smartwatch with health features');

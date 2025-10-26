-- Supabase Database Schema Setup
-- This script creates the complete database structure for Willowbrook Clothing
-- Based on the existing schema from netlify/functions/lib/database.ts

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  "productCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(255) NOT NULL,
  categories TEXT[] DEFAULT '{}',
  "basePrice" DECIMAL(10,2) NOT NULL CHECK ("basePrice" >= 0),
  images TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  "isActive" BOOLEAN DEFAULT true,
  "customizationOptions" JSONB,
  "threeDModelUrl" VARCHAR(500),
  "materialInfo" JSONB,
  "careInstructions" TEXT[],
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customizations table
CREATE TABLE IF NOT EXISTS customizations (
  id VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  "productId" VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(255) NOT NULL,
  color VARCHAR(255) NOT NULL,
  embroidery JSONB,
  "logoUrl" VARCHAR(500),
  "previewUrl" VARCHAR(500),
  "totalPrice" DECIMAL(10,2) NOT NULL CHECK ("totalPrice" >= 0),
  "sleeveId" VARCHAR(255),
  "customMeasurements" JSONB,
  "customOptions" JSONB,
  "priceBreakdown" JSONB,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'PROCESSING', 'MANUFACTURING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  "totalAmount" DECIMAL(10,2) NOT NULL CHECK ("totalAmount" >= 0),
  "paymentId" VARCHAR(255),
  "shippingInfo" JSONB NOT NULL,
  "trackingCode" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(255) PRIMARY KEY,
  "orderId" VARCHAR(255) REFERENCES orders(id) ON DELETE CASCADE,
  "productId" VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  "customizationId" VARCHAR(255) REFERENCES customizations(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0)
);

-- Create customer_reviews table
CREATE TABLE IF NOT EXISTS customer_reviews (
  id VARCHAR(255) PRIMARY KEY,
  "productId" VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  "customerId" VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  "customerName" VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  helpful INTEGER DEFAULT 0 CHECK (helpful >= 0),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create review_photos table
CREATE TABLE IF NOT EXISTS review_photos (
  id VARCHAR(255) PRIMARY KEY,
  "reviewId" VARCHAR(255) REFERENCES customer_reviews(id) ON DELETE CASCADE,
  "storagePath" VARCHAR(255) NOT NULL, -- Supabase Storage path
  "publicUrl" VARCHAR(500) NOT NULL, -- Supabase public URL
  alt VARCHAR(255),
  width INTEGER CHECK (width > 0),
  height INTEGER CHECK (height > 0),
  format VARCHAR(10),
  "fileSize" INTEGER NOT NULL CHECK ("fileSize" > 0),
  "originalFilename" VARCHAR(255),
  "bucketName" VARCHAR(100) DEFAULT 'review-photos',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customer_measurements table
CREATE TABLE IF NOT EXISTS customer_measurements (
  id VARCHAR(255) PRIMARY KEY,
  "customerId" VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  measurements JSONB NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customization_preferences table
CREATE TABLE IF NOT EXISTS customization_preferences (
  id VARCHAR(255) PRIMARY KEY,
  "customerId" VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  "savedMeasurements" JSONB,
  "preferredColors" TEXT[] DEFAULT '{}',
  "preferredSizes" TEXT[] DEFAULT '{}',
  notes TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users("createdAt");

CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_name ON product_categories(name);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_categories ON products USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products("isActive");
CREATE INDEX IF NOT EXISTS idx_products_base_price ON products("basePrice");
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products("createdAt");
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

CREATE INDEX IF NOT EXISTS idx_customizations_user_id ON customizations("userId");
CREATE INDEX IF NOT EXISTS idx_customizations_product_id ON customizations("productId");
CREATE INDEX IF NOT EXISTS idx_customizations_created_at ON customizations("createdAt");

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders("userId");
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders("createdAt");
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders("paymentId");

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items("orderId");
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items("productId");
CREATE INDEX IF NOT EXISTS idx_order_items_customization_id ON order_items("customizationId");

CREATE INDEX IF NOT EXISTS idx_customer_reviews_product_id ON customer_reviews("productId");
CREATE INDEX IF NOT EXISTS idx_customer_reviews_customer_id ON customer_reviews("customerId");
CREATE INDEX IF NOT EXISTS idx_customer_reviews_rating ON customer_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_verified ON customer_reviews(verified);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_created_at ON customer_reviews("createdAt");

CREATE INDEX IF NOT EXISTS idx_review_photos_review_id ON review_photos("reviewId");
CREATE INDEX IF NOT EXISTS idx_review_photos_storage_path ON review_photos("storagePath");
CREATE INDEX IF NOT EXISTS idx_review_photos_bucket ON review_photos("bucketName");

CREATE INDEX IF NOT EXISTS idx_customer_measurements_customer_id ON customer_measurements("customerId");
CREATE INDEX IF NOT EXISTS idx_customer_measurements_updated_at ON customer_measurements("updatedAt");

CREATE INDEX IF NOT EXISTS idx_customization_preferences_customer_id ON customization_preferences("customerId");

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products("isActive", category) WHERE "isActive" = true;
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders("userId", status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_verified ON customer_reviews("productId", verified);

-- Add triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to tables with updatedAt columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customizations_updated_at BEFORE UPDATE ON customizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_reviews_updated_at BEFORE UPDATE ON customer_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_measurements_updated_at BEFORE UPDATE ON customer_measurements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customization_preferences_updated_at BEFORE UPDATE ON customization_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts for customers and administrators';
COMMENT ON TABLE product_categories IS 'Product categories for organizing the catalog';
COMMENT ON TABLE products IS 'Product catalog with customization options';
COMMENT ON TABLE customizations IS 'Customer product customizations and configurations';
COMMENT ON TABLE orders IS 'Customer orders and order tracking';
COMMENT ON TABLE order_items IS 'Individual items within orders';
COMMENT ON TABLE customer_reviews IS 'Product reviews and ratings from customers';
COMMENT ON TABLE review_photos IS 'Photos attached to customer reviews';
COMMENT ON TABLE customer_measurements IS 'Saved customer measurements for custom sizing';
COMMENT ON TABLE customization_preferences IS 'Customer preferences for future customizations';

-- Add column comments for key fields
COMMENT ON COLUMN users.role IS 'User role: CUSTOMER or ADMIN';
COMMENT ON COLUMN products."basePrice" IS 'Base price in cents (Indian Rupees)';
COMMENT ON COLUMN products.categories IS 'Array of category IDs this product belongs to';
COMMENT ON COLUMN products."customizationOptions" IS 'JSON configuration for available customization options';
COMMENT ON COLUMN orders.status IS 'Order status: PENDING, PAID, PROCESSING, MANUFACTURING, SHIPPED, DELIVERED, CANCELLED';
COMMENT ON COLUMN orders."shippingInfo" IS 'JSON object containing shipping address and preferences';
COMMENT ON COLUMN customer_reviews.verified IS 'Whether the reviewer purchased the product';
COMMENT ON COLUMN customer_reviews.helpful IS 'Number of helpful votes for this review';

-- Create a view for product statistics
CREATE OR REPLACE VIEW product_stats AS
SELECT 
    p.id,
    p.name,
    p.category,
    p."basePrice",
    p."isActive",
    COALESCE(AVG(cr.rating), 0) as average_rating,
    COUNT(cr.id) as review_count,
    COUNT(CASE WHEN cr.verified = true THEN 1 END) as verified_review_count,
    COUNT(DISTINCT o.id) as order_count,
    COALESCE(SUM(oi.quantity), 0) as total_sold
FROM products p
LEFT JOIN customer_reviews cr ON p.id = cr."productId"
LEFT JOIN order_items oi ON p.id = oi."productId"
LEFT JOIN orders o ON oi."orderId" = o.id AND o.status IN ('PAID', 'PROCESSING', 'MANUFACTURING', 'SHIPPED', 'DELIVERED')
GROUP BY p.id, p.name, p.category, p."basePrice", p."isActive";

COMMENT ON VIEW product_stats IS 'Aggregated statistics for products including ratings, reviews, and sales data';

-- Create a view for order summaries
CREATE OR REPLACE VIEW order_summaries AS
SELECT 
    o.id,
    o."userId",
    o.status,
    o."totalAmount",
    o."createdAt",
    o."updatedAt",
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_quantity,
    u.email as user_email,
    u.name as user_name
FROM orders o
LEFT JOIN order_items oi ON o.id = oi."orderId"
LEFT JOIN users u ON o."userId" = u.id
GROUP BY o.id, o."userId", o.status, o."totalAmount", o."createdAt", o."updatedAt", u.email, u.name;

COMMENT ON VIEW order_summaries IS 'Order summaries with item counts and user information';

-- Grant necessary permissions (adjust as needed for your Supabase setup)
-- Note: Supabase handles most permissions through RLS policies
-- These are basic table permissions

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_preferences ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (these can be customized based on your security requirements)

-- Users can read their own data, admins can read all
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN'
    ));

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- Product categories are publicly readable
CREATE POLICY "Product categories are publicly readable" ON product_categories
    FOR SELECT USING (true);

-- Products are publicly readable when active
CREATE POLICY "Active products are publicly readable" ON products
    FOR SELECT USING ("isActive" = true OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN'
    ));

-- Users can manage their own customizations
CREATE POLICY "Users can manage own customizations" ON customizations
    FOR ALL USING (auth.uid()::text = "userId" OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN'
    ));

-- Users can manage their own orders
CREATE POLICY "Users can manage own orders" ON orders
    FOR ALL USING (auth.uid()::text = "userId" OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN'
    ));

-- Order items follow order permissions
CREATE POLICY "Order items follow order permissions" ON order_items
    FOR ALL USING (EXISTS (
        SELECT 1 FROM orders WHERE id = "orderId" AND (
            auth.uid()::text = "userId" OR EXISTS (
                SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN'
            )
        )
    ));

-- Reviews are publicly readable, users can manage their own
CREATE POLICY "Reviews are publicly readable" ON customer_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own reviews" ON customer_reviews
    FOR INSERT WITH CHECK (auth.uid()::text = "customerId");

CREATE POLICY "Users can update own reviews" ON customer_reviews
    FOR UPDATE USING (auth.uid()::text = "customerId");

CREATE POLICY "Users can delete own reviews" ON customer_reviews
    FOR DELETE USING (auth.uid()::text = "customerId" OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN'
    ));

-- Review photos follow review permissions
CREATE POLICY "Review photos are publicly readable" ON review_photos
    FOR SELECT USING (true);

CREATE POLICY "Users can manage photos for own reviews" ON review_photos
    FOR ALL USING (EXISTS (
        SELECT 1 FROM customer_reviews WHERE id = "reviewId" AND (
            auth.uid()::text = "customerId" OR EXISTS (
                SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN'
            )
        )
    ));

-- Users can manage their own measurements and preferences
CREATE POLICY "Users can manage own measurements" ON customer_measurements
    FOR ALL USING (auth.uid()::text = "customerId" OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN'
    ));

CREATE POLICY "Users can manage own preferences" ON customization_preferences
    FOR ALL USING (auth.uid()::text = "customerId" OR EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN'
    ));

-- Success message
SELECT 'Supabase database schema setup completed successfully!' as message;
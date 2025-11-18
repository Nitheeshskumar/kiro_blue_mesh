-- Supabase Sample Data Setup
-- This script populates the database with sample data for development and testing
-- Based on the sample data from netlify/functions/lib/database.ts

-- Clear existing data (optional - uncomment if you want to reset)
-- TRUNCATE TABLE review_photos CASCADE;
-- TRUNCATE TABLE customer_reviews CASCADE;
-- TRUNCATE TABLE order_items CASCADE;
-- TRUNCATE TABLE orders CASCADE;
-- TRUNCATE TABLE customizations CASCADE;
-- TRUNCATE TABLE customer_measurements CASCADE;
-- TRUNCATE TABLE customization_preferences CASCADE;
-- TRUNCATE TABLE products CASCADE;
-- TRUNCATE TABLE product_categories CASCADE;
-- TRUNCATE TABLE users CASCADE;

-- Insert product categories
INSERT INTO product_categories (id, name, slug, description, icon, "productCount") VALUES
('mother-daughter', 'Mother & Daughter Collections', 'mother-daughter', 'Matching outfits for special bonding moments', '👩‍👧', 0),
('birthday-celebration', 'Birthday Celebration Outfits', 'birthday-celebration', 'Festive wear for memorable celebrations', '🎂', 0),
('cotton-essentials', 'Everyday Cotton Essentials', 'cotton-essentials', 'Comfortable daily wear in premium cotton', '👕', 0),
('maternity', 'Maternity Collection', 'maternity', 'Stylish and comfortable clothing for expecting mothers', '🤱', 0),
('newborn-essentials', 'Newborn Essentials', 'newborn-essentials', 'Soft, safe clothing for babies 0-12 months', '👶', 0),
('accessories', 'Accessories & Add-ons', 'accessories', 'Complementary items like scarves, belts, jewelry', '👜', 0),
('kids-coordinated', 'Kids Coordinated Sets', 'kids-coordinated', 'Mix-and-match pieces for children', '👦', 0)
ON CONFLICT (id) DO NOTHING;

-- Insert admin user (password: secret123, hashed with bcrypt)
INSERT INTO users (id, email, name, password, role) VALUES
('admin-1', 'admin@willowbrook.com', 'Admin User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Insert sample customer users
INSERT INTO users (id, email, name, password, role) VALUES
('user-1', 'customer1@example.com', 'Sarah Johnson', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'CUSTOMER'),
('user-2', 'customer2@example.com', 'Emily Chen', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'CUSTOMER'),
('user-3', 'customer3@example.com', 'Maria Rodriguez', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'CUSTOMER')
ON CONFLICT (email) DO NOTHING;

-- Insert sample products with enhanced customization options
INSERT INTO products (
    id, name, description, category, categories, "basePrice", images, sizes, colors, 
    "customizationOptions", "materialInfo", "careInstructions"
) VALUES
(
    'prod-1',
    'Classic T-Shirt',
    'Comfortable cotton t-shirt perfect for customization',
    'shirts',
    ARRAY['cotton-essentials', 'mother-daughter'],
    2075.00,
    ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400'],
    ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    ARRAY['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00', '#FFFF00'],
    '{
        "colors": [
            {"id": "black", "name": "Black", "hexCode": "#000000", "available": true, "priceModifier": 0},
            {"id": "white", "name": "White", "hexCode": "#FFFFFF", "available": true, "priceModifier": 0},
            {"id": "red", "name": "Red", "hexCode": "#FF0000", "available": true, "priceModifier": 166},
            {"id": "blue", "name": "Blue", "hexCode": "#0000FF", "available": true, "priceModifier": 166},
            {"id": "green", "name": "Green", "hexCode": "#00FF00", "available": true, "priceModifier": 166},
            {"id": "yellow", "name": "Yellow", "hexCode": "#FFFF00", "available": true, "priceModifier": 166}
        ],
        "sizes": [
            {"id": "xs", "name": "XS", "category": "standard", "available": true, "priceModifier": 0},
            {"id": "s", "name": "S", "category": "standard", "available": true, "priceModifier": 0},
            {"id": "m", "name": "M", "category": "standard", "available": true, "priceModifier": 0},
            {"id": "l", "name": "L", "category": "standard", "available": true, "priceModifier": 0},
            {"id": "xl", "name": "XL", "category": "standard", "available": true, "priceModifier": 249},
            {"id": "xxl", "name": "XXL", "category": "standard", "available": true, "priceModifier": 415},
            {"id": "custom", "name": "Custom Measurements", "category": "custom", "available": true, "priceModifier": 830}
        ],
        "sleeves": [
            {"id": "short", "name": "Short Sleeve", "description": "Classic short sleeves", "category": "short", "available": true, "priceModifier": 0},
            {"id": "long", "name": "Long Sleeve", "description": "Full-length sleeves", "category": "long", "available": true, "priceModifier": 415},
            {"id": "sleeveless", "name": "Tank Top", "description": "No sleeves", "category": "sleeveless", "available": true, "priceModifier": -249}
        ],
        "customOptions": [
            {"id": "embroidery", "name": "Custom Embroidery", "type": "text", "required": false, "priceModifier": 664},
            {"id": "logo", "name": "Logo Upload", "type": "image", "required": false, "priceModifier": 996}
        ],
        "allowCustomMeasurements": true
    }',
    '[{"name": "Cotton", "percentage": 100, "properties": ["Breathable", "Soft", "Durable"]}]',
    ARRAY['Machine wash cold', 'Tumble dry low', 'Do not bleach']
),
(
    'prod-2',
    'Premium Hoodie',
    'Warm and cozy hoodie with premium materials',
    'hoodies',
    ARRAY['cotton-essentials', 'birthday-celebration'],
    3735.00,
    ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400'],
    ARRAY['S', 'M', 'L', 'XL', 'XXL'],
    ARRAY['#000000', '#FFFFFF', '#808080', '#000080', '#800000'],
    '{
        "colors": [
            {"id": "black", "name": "Black", "hexCode": "#000000", "available": true, "priceModifier": 0},
            {"id": "white", "name": "White", "hexCode": "#FFFFFF", "available": true, "priceModifier": 0},
            {"id": "gray", "name": "Gray", "hexCode": "#808080", "available": true, "priceModifier": 0},
            {"id": "navy", "name": "Navy", "hexCode": "#000080", "available": true, "priceModifier": 166},
            {"id": "maroon", "name": "Maroon", "hexCode": "#800000", "available": true, "priceModifier": 166}
        ],
        "sizes": [
            {"id": "s", "name": "S", "category": "standard", "available": true, "priceModifier": 0},
            {"id": "m", "name": "M", "category": "standard", "available": true, "priceModifier": 0},
            {"id": "l", "name": "L", "category": "standard", "available": true, "priceModifier": 0},
            {"id": "xl", "name": "XL", "category": "standard", "available": true, "priceModifier": 249},
            {"id": "xxl", "name": "XXL", "category": "standard", "available": true, "priceModifier": 415}
        ],
        "customOptions": [
            {"id": "embroidery", "name": "Custom Embroidery", "type": "text", "required": false, "priceModifier": 830},
            {"id": "logo", "name": "Logo Upload", "type": "image", "required": false, "priceModifier": 1245}
        ]
    }',
    '[{"name": "Cotton", "percentage": 80, "properties": ["Soft", "Warm"]}, {"name": "Polyester", "percentage": 20, "properties": ["Durable", "Shape-retaining"]}]',
    ARRAY['Machine wash cold', 'Tumble dry low', 'Do not bleach', 'Iron on low heat']
),
(
    'prod-3',
    'Baseball Cap',
    'Classic baseball cap with adjustable strap',
    'accessories',
    ARRAY['accessories', 'kids-coordinated'],
    1660.00,
    ARRAY['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=400'],
    ARRAY['One Size'],
    ARRAY['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#00FF00'],
    '{
        "colors": [
            {"id": "black", "name": "Black", "hexCode": "#000000", "available": true, "priceModifier": 0},
            {"id": "white", "name": "White", "hexCode": "#FFFFFF", "available": true, "priceModifier": 0},
            {"id": "red", "name": "Red", "hexCode": "#FF0000", "available": true, "priceModifier": 83},
            {"id": "blue", "name": "Blue", "hexCode": "#0000FF", "available": true, "priceModifier": 83},
            {"id": "green", "name": "Green", "hexCode": "#00FF00", "available": true, "priceModifier": 83}
        ],
        "sizes": [
            {"id": "onesize", "name": "One Size", "category": "adjustable", "available": true, "priceModifier": 0}
        ],
        "customOptions": [
            {"id": "embroidery", "name": "Custom Embroidery", "type": "text", "required": false, "priceModifier": 498},
            {"id": "logo", "name": "Logo Upload", "type": "image", "required": false, "priceModifier": 664}
        ]
    }',
    '[{"name": "Cotton", "percentage": 100, "properties": ["Breathable", "Comfortable"]}]',
    ARRAY['Hand wash recommended', 'Air dry', 'Do not bleach']
),
(
    'prod-4',
    'Maternity Dress',
    'Elegant and comfortable dress for expecting mothers',
    'dresses',
    ARRAY['maternity', 'cotton-essentials'],
    5395.00,
    ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'],
    ARRAY['XS', 'S', 'M', 'L', 'XL'],
    ARRAY['#000080', '#800080', '#008000', '#000000'],
    '{
        "colors": [
            {"id": "navy", "name": "Navy", "hexCode": "#000080", "available": true, "priceModifier": 0},
            {"id": "purple", "name": "Purple", "hexCode": "#800080", "available": true, "priceModifier": 166},
            {"id": "green", "name": "Green", "hexCode": "#008000", "available": true, "priceModifier": 166},
            {"id": "black", "name": "Black", "hexCode": "#000000", "available": true, "priceModifier": 0}
        ],
        "sizes": [
            {"id": "xs", "name": "XS", "category": "maternity", "available": true, "priceModifier": 0},
            {"id": "s", "name": "S", "category": "maternity", "available": true, "priceModifier": 0},
            {"id": "m", "name": "M", "category": "maternity", "available": true, "priceModifier": 0},
            {"id": "l", "name": "L", "category": "maternity", "available": true, "priceModifier": 0},
            {"id": "xl", "name": "XL", "category": "maternity", "available": true, "priceModifier": 249}
        ],
        "customOptions": [
            {"id": "length", "name": "Custom Length", "type": "measurement", "required": false, "priceModifier": 415}
        ],
        "allowCustomMeasurements": true
    }',
    '[{"name": "Cotton", "percentage": 95, "properties": ["Soft", "Stretchy", "Breathable"]}, {"name": "Elastane", "percentage": 5, "properties": ["Stretch", "Recovery"]}]',
    ARRAY['Machine wash cold', 'Gentle cycle', 'Hang dry', 'Iron on low']
),
(
    'prod-5',
    'Baby Onesie Set',
    'Soft organic cotton onesies for newborns',
    'baby-clothes',
    ARRAY['newborn-essentials', 'cotton-essentials'],
    2905.00,
    ARRAY['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400'],
    ARRAY['0-3M', '3-6M', '6-9M', '9-12M'],
    ARRAY['#FFB6C1', '#87CEEB', '#98FB98', '#FFFFE0'],
    '{
        "colors": [
            {"id": "pink", "name": "Light Pink", "hexCode": "#FFB6C1", "available": true, "priceModifier": 0},
            {"id": "blue", "name": "Sky Blue", "hexCode": "#87CEEB", "available": true, "priceModifier": 0},
            {"id": "green", "name": "Light Green", "hexCode": "#98FB98", "available": true, "priceModifier": 0},
            {"id": "yellow", "name": "Light Yellow", "hexCode": "#FFFFE0", "available": true, "priceModifier": 0}
        ],
        "sizes": [
            {"id": "0-3m", "name": "0-3 Months", "category": "baby", "available": true, "priceModifier": 0},
            {"id": "3-6m", "name": "3-6 Months", "category": "baby", "available": true, "priceModifier": 0},
            {"id": "6-9m", "name": "6-9 Months", "category": "baby", "available": true, "priceModifier": 83},
            {"id": "9-12m", "name": "9-12 Months", "category": "baby", "available": true, "priceModifier": 166}
        ],
        "customOptions": [
            {"id": "name", "name": "Baby Name Embroidery", "type": "text", "required": false, "priceModifier": 415}
        ]
    }',
    '[{"name": "Organic Cotton", "percentage": 100, "properties": ["Hypoallergenic", "Soft", "Safe"]}]',
    ARRAY['Machine wash warm', 'Gentle cycle', 'Tumble dry low', 'Use baby-safe detergent']
),
(
    'prod-6',
    'Birthday Party Dress',
    'Special occasion dress perfect for celebrations',
    'dresses',
    ARRAY['birthday-celebration', 'kids-coordinated'],
    4565.00,
    ARRAY['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400', 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400', 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400'],
    ARRAY['2T', '3T', '4T', '5T', '6T'],
    ARRAY['#FF69B4', '#9370DB', '#FFD700', '#FF6347'],
    '{
        "colors": [
            {"id": "hotpink", "name": "Hot Pink", "hexCode": "#FF69B4", "available": true, "priceModifier": 0},
            {"id": "purple", "name": "Medium Purple", "hexCode": "#9370DB", "available": true, "priceModifier": 166},
            {"id": "gold", "name": "Gold", "hexCode": "#FFD700", "available": true, "priceModifier": 249},
            {"id": "coral", "name": "Tomato", "hexCode": "#FF6347", "available": true, "priceModifier": 166}
        ],
        "sizes": [
            {"id": "2t", "name": "2T", "category": "toddler", "available": true, "priceModifier": 0},
            {"id": "3t", "name": "3T", "category": "toddler", "available": true, "priceModifier": 0},
            {"id": "4t", "name": "4T", "category": "toddler", "available": true, "priceModifier": 83},
            {"id": "5t", "name": "5T", "category": "toddler", "available": true, "priceModifier": 166},
            {"id": "6t", "name": "6T", "category": "toddler", "available": true, "priceModifier": 249}
        ],
        "customOptions": [
            {"id": "embroidery", "name": "Custom Embroidery", "type": "text", "required": false, "priceModifier": 581},
            {"id": "bow", "name": "Add Matching Bow", "type": "addon", "required": false, "priceModifier": 332}
        ]
    }',
    '[{"name": "Polyester", "percentage": 70, "properties": ["Wrinkle-resistant", "Durable"]}, {"name": "Cotton", "percentage": 30, "properties": ["Soft", "Comfortable"]}]',
    ARRAY['Machine wash cold', 'Gentle cycle', 'Hang dry', 'Iron on medium heat']
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample customizations
INSERT INTO customizations (
    id, "userId", "productId", size, color, embroidery, "logoUrl", "previewUrl", 
    "totalPrice", "sleeveId", "customMeasurements", "customOptions", "priceBreakdown"
) VALUES
(
    'custom-1',
    'user-1',
    'prod-1',
    'M',
    '#FF0000',
    '{"text": "Sarah", "position": "chest", "font": "Arial", "color": "#FFFFFF"}',
    NULL,
    'https://example.com/preview1.jpg',
    2905.00,
    'short',
    NULL,
    '{"embroidery": {"text": "Sarah", "position": "chest"}}',
    '{"basePrice": 2075.00, "colorModifier": 166, "embroideryModifier": 664, "total": 2905.00}'
),
(
    'custom-2',
    'user-2',
    'prod-2',
    'L',
    '#000000',
    NULL,
    NULL,
    'https://example.com/preview2.jpg',
    3735.00,
    NULL,
    NULL,
    '{}',
    '{"basePrice": 3735.00, "total": 3735.00}'
),
(
    'custom-3',
    'user-3',
    'prod-5',
    '3-6M',
    '#FFB6C1',
    '{"text": "Emma", "position": "chest", "font": "Comic Sans", "color": "#FF69B4"}',
    NULL,
    'https://example.com/preview3.jpg',
    3320.00,
    NULL,
    NULL,
    '{"name": {"text": "Emma"}}',
    '{"basePrice": 2905.00, "nameEmbroidery": 415, "total": 3320.00}'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample orders
INSERT INTO orders (
    id, "userId", status, "totalAmount", "paymentId", "shippingInfo", "trackingCode"
) VALUES
(
    'order-1',
    'user-1',
    'DELIVERED',
    2905.00,
    'pi_1234567890',
    '{"name": "Sarah Johnson", "address": "123 Main St", "city": "Mumbai", "state": "Maharashtra", "zipCode": "400001", "country": "India", "phone": "+91 9876543210"}',
    'WB123456789IN'
),
(
    'order-2',
    'user-2',
    'SHIPPED',
    3735.00,
    'pi_0987654321',
    '{"name": "Emily Chen", "address": "456 Oak Ave", "city": "Delhi", "state": "Delhi", "zipCode": "110001", "country": "India", "phone": "+91 8765432109"}',
    'WB987654321IN'
),
(
    'order-3',
    'user-3',
    'PROCESSING',
    3320.00,
    'pi_1122334455',
    '{"name": "Maria Rodriguez", "address": "789 Pine Rd", "city": "Bangalore", "state": "Karnataka", "zipCode": "560001", "country": "India", "phone": "+91 7654321098"}',
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample order items
INSERT INTO order_items (id, "orderId", "productId", "customizationId", quantity, price) VALUES
('item-1', 'order-1', 'prod-1', 'custom-1', 1, 2905.00),
('item-2', 'order-2', 'prod-2', 'custom-2', 1, 3735.00),
('item-3', 'order-3', 'prod-5', 'custom-3', 1, 3320.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample customer reviews
INSERT INTO customer_reviews (
    id, "productId", "customerId", "customerName", rating, title, content, verified, helpful
) VALUES
(
    'review-1',
    'prod-1',
    'user-1',
    'Sarah Johnson',
    5,
    'Perfect fit and quality!',
    'I absolutely love this t-shirt! The customization turned out exactly as I wanted, and the fabric quality is excellent. The embroidery is neat and professional. Highly recommend!',
    true,
    12
),
(
    'review-2',
    'prod-2',
    'user-2',
    'Emily Chen',
    4,
    'Great hoodie, runs a bit large',
    'The hoodie is very comfortable and warm. The material feels premium. Only issue is it runs slightly larger than expected, so consider sizing down. Overall very satisfied with the purchase.',
    true,
    8
),
(
    'review-3',
    'prod-1',
    'user-3',
    'Maria Rodriguez',
    5,
    'Amazing customer service',
    'Not only is the product great, but the customer service was exceptional. They helped me with the sizing and the final product exceeded my expectations. Will definitely order again!',
    false,
    5
),
(
    'review-4',
    'prod-5',
    'user-1',
    'Sarah Johnson',
    5,
    'Perfect for my baby',
    'These onesies are so soft and comfortable for my little one. The organic cotton is gentle on sensitive skin and the custom embroidery is adorable. Great quality!',
    true,
    15
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample review photos
INSERT INTO review_photos (
    id, "reviewId", "storagePath", "publicUrl", alt, width, height, format, "fileSize", "originalFilename", "bucketName"
) VALUES
(
    'photo-1',
    'review-1',
    'reviews/tshirt_custom_1.jpg',
    'https://frbdhevxgofuvnrcbcvi.supabase.co/storage/v1/object/public/review-photos/reviews/tshirt_custom_1.jpg',
    'Custom t-shirt with embroidery',
    800,
    600,
    'jpg',
    156789,
    'my_custom_tshirt.jpg',
    'review-photos'
),
(
    'photo-2',
    'review-2',
    'reviews/hoodie_black_1.jpg',
    'https://frbdhevxgofuvnrcbcvi.supabase.co/storage/v1/object/public/review-photos/reviews/hoodie_black_1.jpg',
    'Black premium hoodie',
    1024,
    768,
    'jpg',
    234567,
    'hoodie_photo.jpg',
    'review-photos'
),
(
    'photo-3',
    'review-4',
    'reviews/baby_onesie_1.jpg',
    'https://frbdhevxgofuvnrcbcvi.supabase.co/storage/v1/object/public/review-photos/reviews/baby_onesie_1.jpg',
    'Baby onesie with custom name',
    600,
    800,
    'jpg',
    123456,
    'baby_onesie.jpg',
    'review-photos'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample customer measurements
INSERT INTO customer_measurements (
    id, "customerId", measurements, notes
) VALUES
(
    'measurements-1',
    'user-1',
    '{"chest": 36, "waist": 28, "hips": 38, "shoulderWidth": 16, "armLength": 24, "height": 165, "weight": 60, "unit": "inches"}',
    'Prefers slightly loose fit around waist'
),
(
    'measurements-2',
    'user-2',
    '{"chest": 34, "waist": 26, "hips": 36, "shoulderWidth": 15, "armLength": 23, "height": 160, "weight": 55, "unit": "inches"}',
    'Athletic build, prefers fitted clothing'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample customization preferences
INSERT INTO customization_preferences (
    id, "customerId", "savedMeasurements", "preferredColors", "preferredSizes", notes
) VALUES
(
    'prefs-1',
    'user-1',
    '{"chest": 36, "waist": 28, "hips": 38, "shoulderWidth": 16, "armLength": 24}',
    ARRAY['#FF0000', '#000000', '#FFFFFF'],
    ARRAY['M', 'L'],
    'Loves red and black combinations, prefers medium to large sizes'
),
(
    'prefs-2',
    'user-2',
    '{"chest": 34, "waist": 26, "hips": 36, "shoulderWidth": 15, "armLength": 23}',
    ARRAY['#000000', '#808080', '#000080'],
    ARRAY['S', 'M'],
    'Prefers darker colors, classic styles'
),
(
    'prefs-3',
    'user-3',
    NULL,
    ARRAY['#FFB6C1', '#87CEEB', '#98FB98'],
    ARRAY['0-3M', '3-6M'],
    'Shopping for baby items, loves pastel colors'
)
ON CONFLICT (id) DO NOTHING;

-- Update product counts in categories
UPDATE product_categories SET "productCount" = (
    SELECT COUNT(*) FROM products 
    WHERE "isActive" = true AND (
        product_categories.id = ANY(products.categories) OR 
        products.category = product_categories.id
    )
);

-- Success message
SELECT 'Sample data inserted successfully!' as message,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM products) as total_products,
       (SELECT COUNT(*) FROM product_categories) as total_categories,
       (SELECT COUNT(*) FROM orders) as total_orders,
       (SELECT COUNT(*) FROM customer_reviews) as total_reviews;
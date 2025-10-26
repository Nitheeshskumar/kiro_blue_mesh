-- Supabase Database Validation Script
-- This script validates that the database schema and sample data were set up correctly

-- Check if all required tables exist
SELECT 
    'Table Validation' as check_type,
    CASE 
        WHEN COUNT(*) = 10 THEN 'PASS: All 10 tables exist'
        ELSE 'FAIL: Missing tables - Expected 10, Found ' || COUNT(*)
    END as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'product_categories', 'products', 'customizations', 
    'orders', 'order_items', 'customer_reviews', 'review_photos',
    'customer_measurements', 'customization_preferences'
);

-- Check table structures and key columns
SELECT 
    'Column Validation' as check_type,
    table_name,
    COUNT(*) as column_count,
    CASE 
        WHEN table_name = 'users' AND COUNT(*) >= 7 THEN 'PASS'
        WHEN table_name = 'products' AND COUNT(*) >= 14 THEN 'PASS'
        WHEN table_name = 'orders' AND COUNT(*) >= 8 THEN 'PASS'
        WHEN table_name = 'customer_reviews' AND COUNT(*) >= 10 THEN 'PASS'
        WHEN COUNT(*) >= 5 THEN 'PASS'
        ELSE 'FAIL: Insufficient columns'
    END as result
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'product_categories', 'products', 'customizations', 
    'orders', 'order_items', 'customer_reviews', 'review_photos',
    'customer_measurements', 'customization_preferences'
)
GROUP BY table_name
ORDER BY table_name;

-- Check foreign key constraints
SELECT 
    'Foreign Key Validation' as check_type,
    COUNT(*) as constraint_count,
    CASE 
        WHEN COUNT(*) >= 8 THEN 'PASS: Foreign key constraints exist'
        ELSE 'FAIL: Missing foreign key constraints - Expected >= 8, Found ' || COUNT(*)
    END as result
FROM information_schema.table_constraints 
WHERE constraint_schema = 'public' 
AND constraint_type = 'FOREIGN KEY';

-- Check indexes
SELECT 
    'Index Validation' as check_type,
    COUNT(*) as index_count,
    CASE 
        WHEN COUNT(*) >= 15 THEN 'PASS: Sufficient indexes created'
        ELSE 'WARN: Few indexes - Expected >= 15, Found ' || COUNT(*)
    END as result
FROM pg_indexes 
WHERE schemaname = 'public';

-- Check triggers
SELECT 
    'Trigger Validation' as check_type,
    COUNT(*) as trigger_count,
    CASE 
        WHEN COUNT(*) >= 8 THEN 'PASS: Update triggers exist'
        ELSE 'FAIL: Missing update triggers - Expected >= 8, Found ' || COUNT(*)
    END as result
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE '%updated_at%';

-- Check views
SELECT 
    'View Validation' as check_type,
    COUNT(*) as view_count,
    CASE 
        WHEN COUNT(*) >= 2 THEN 'PASS: Helper views created'
        ELSE 'FAIL: Missing views - Expected >= 2, Found ' || COUNT(*)
    END as result
FROM information_schema.views 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT 
    'RLS Policy Validation' as check_type,
    COUNT(*) as policy_count,
    CASE 
        WHEN COUNT(*) >= 10 THEN 'PASS: RLS policies configured'
        ELSE 'WARN: Few RLS policies - Expected >= 10, Found ' || COUNT(*)
    END as result
FROM pg_policies 
WHERE schemaname = 'public';

-- Data validation checks
SELECT 'Data Validation - Users' as check_type,
       COUNT(*) as record_count,
       CASE 
           WHEN COUNT(*) >= 1 THEN 'PASS: Users data exists'
           ELSE 'FAIL: No user data found'
       END as result
FROM users;

SELECT 'Data Validation - Categories' as check_type,
       COUNT(*) as record_count,
       CASE 
           WHEN COUNT(*) >= 7 THEN 'PASS: All categories exist'
           ELSE 'FAIL: Missing categories - Expected 7, Found ' || COUNT(*)
       END as result
FROM product_categories;

SELECT 'Data Validation - Products' as check_type,
       COUNT(*) as record_count,
       CASE 
           WHEN COUNT(*) >= 6 THEN 'PASS: Sample products exist'
           ELSE 'FAIL: Missing products - Expected 6, Found ' || COUNT(*)
       END as result
FROM products;

SELECT 'Data Validation - Admin User' as check_type,
       COUNT(*) as admin_count,
       CASE 
           WHEN COUNT(*) >= 1 THEN 'PASS: Admin user exists'
           ELSE 'FAIL: No admin user found'
       END as result
FROM users WHERE role = 'ADMIN';

-- Check data integrity
SELECT 'Data Integrity - Product Categories' as check_type,
       COUNT(*) as products_with_valid_categories,
       CASE 
           WHEN COUNT(*) = (SELECT COUNT(*) FROM products) THEN 'PASS: All products have valid categories'
           ELSE 'FAIL: Some products have invalid categories'
       END as result
FROM products p
WHERE EXISTS (
    SELECT 1 FROM product_categories pc 
    WHERE pc.id = ANY(p.categories) OR pc.id = p.category
);

SELECT 'Data Integrity - Customizations' as check_type,
       COUNT(*) as valid_customizations,
       CASE 
           WHEN COUNT(*) = (SELECT COUNT(*) FROM customizations) THEN 'PASS: All customizations have valid references'
           ELSE 'FAIL: Some customizations have invalid references'
       END as result
FROM customizations c
WHERE EXISTS (SELECT 1 FROM users WHERE id = c."userId")
AND EXISTS (SELECT 1 FROM products WHERE id = c."productId");

SELECT 'Data Integrity - Orders' as check_type,
       COUNT(*) as valid_orders,
       CASE 
           WHEN COUNT(*) = (SELECT COUNT(*) FROM orders) THEN 'PASS: All orders have valid user references'
           ELSE 'FAIL: Some orders have invalid user references'
       END as result
FROM orders o
WHERE EXISTS (SELECT 1 FROM users WHERE id = o."userId");

-- Check JSON data structure
SELECT 'JSON Data Validation - Products' as check_type,
       COUNT(*) as products_with_valid_json,
       CASE 
           WHEN COUNT(*) > 0 THEN 'PASS: Products have customization options'
           ELSE 'FAIL: No products with customization options found'
       END as result
FROM products 
WHERE "customizationOptions" IS NOT NULL 
AND jsonb_typeof("customizationOptions") = 'object';

-- Performance check - sample queries
SELECT 'Performance Check - Product Search' as check_type,
       COUNT(*) as active_products,
       CASE 
           WHEN COUNT(*) > 0 THEN 'PASS: Can query active products'
           ELSE 'FAIL: Cannot query active products'
       END as result
FROM products 
WHERE "isActive" = true;

-- Check array operations
SELECT 'Array Operations Check' as check_type,
       COUNT(*) as products_with_categories,
       CASE 
           WHEN COUNT(*) > 0 THEN 'PASS: Array operations work'
           ELSE 'FAIL: Array operations not working'
       END as result
FROM products 
WHERE array_length(categories, 1) > 0;

-- Final summary
SELECT 
    'VALIDATION SUMMARY' as summary,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM customer_reviews) as total_reviews,
    'Database setup validation complete' as status;
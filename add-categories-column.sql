-- Add categories column to products table if it doesn't exist
-- This allows products to belong to multiple categories

DO $$ 
BEGIN
    -- Check if the column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'categories'
    ) THEN
        ALTER TABLE products ADD COLUMN categories TEXT[] DEFAULT '{}';
        
        -- Create GIN index for better array query performance
        CREATE INDEX IF NOT EXISTS idx_products_categories ON products USING GIN(categories);
        
        -- Migrate existing category data to categories array
        UPDATE products 
        SET categories = ARRAY[category]
        WHERE categories = '{}' OR categories IS NULL;
        
        RAISE NOTICE 'Successfully added categories column to products table';
    ELSE
        RAISE NOTICE 'Column categories already exists in products table';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('category', 'categories');

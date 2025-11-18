-- Add support for fixed colors in products
-- This migration adds fields to support products with fixed colors (like printed designs)

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS "hasFixedColors" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "colorType" VARCHAR(20) DEFAULT 'customizable' CHECK ("colorType" IN ('customizable', 'fixed'));

-- Add comments for documentation
COMMENT ON COLUMN products."hasFixedColors" IS 'True if product colors are fixed to the design/image and not customizable';
COMMENT ON COLUMN products."colorType" IS 'Type of color options: customizable (user can choose colors) or fixed (colors are part of the design)';

-- Update existing products to have customizable colors by default
UPDATE products 
SET "hasFixedColors" = false, "colorType" = 'customizable'
WHERE "hasFixedColors" IS NULL OR "colorType" IS NULL;

-- Create index for better performance on color type queries
CREATE INDEX IF NOT EXISTS idx_products_color_type ON products("colorType");
CREATE INDEX IF NOT EXISTS idx_products_has_fixed_colors ON products("hasFixedColors");

-- Success message
SELECT 'Fixed colors support added successfully!' as message;
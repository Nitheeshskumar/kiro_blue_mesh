-- Migration to add size and color pricing variations
-- This adds support for different prices based on size and color selections

-- Add new columns to products table for pricing variations
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS "sizePricing" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "colorPricing" JSONB DEFAULT '{}';

-- Update existing products to have default pricing structure
UPDATE products 
SET 
  "sizePricing" = '{
    "XS": 0, "S": 0, "M": 0, "L": 0, "XL": 249, "XXL": 415, "3XL": 664,
    "0-3M": 0, "3-6M": 0, "6-9M": 0, "9-12M": 0, "12-18M": 83, "18-24M": 166,
    "2T": 0, "3T": 0, "4T": 83, "5T": 166, "6T": 249,
    "4": 0, "5": 0, "6": 0, "7": 83, "8": 83, "10": 166, "12": 249, "14": 332, "16": 415,
    "One Size": 0
  }'::jsonb,
  "colorPricing" = '{
    "#000000": 0, "#FFFFFF": 0, "#808080": 83, "#FF0000": 166, "#00FF00": 166, 
    "#0000FF": 166, "#FFFF00": 166, "#FF00FF": 249, "#00FFFF": 249, "#FFA500": 249,
    "#800080": 332, "#FFC0CB": 332, "#A52A2A": 415, "#000080": 415, "#008000": 415
  }'::jsonb
WHERE "sizePricing" IS NULL OR "colorPricing" IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN products."sizePricing" IS 'JSON object mapping size names to price modifiers in INR';
COMMENT ON COLUMN products."colorPricing" IS 'JSON object mapping color codes/names to price modifiers in INR';

-- Create index for better performance on pricing queries
CREATE INDEX IF NOT EXISTS idx_products_size_pricing ON products USING GIN("sizePricing");
CREATE INDEX IF NOT EXISTS idx_products_color_pricing ON products USING GIN("colorPricing");

-- Success message
SELECT 'Size and color pricing migration completed successfully!' as message;
require('dotenv').config();
const { Pool } = require('pg');

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Adding sizePricing and colorPricing columns...');
    
    // Add columns if they don't exist
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS "sizePricing" JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS "colorPricing" JSONB DEFAULT '{}'
    `);
    
    console.log('Columns added successfully!');
    
    // Update existing products with default pricing
    await pool.query(`
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
      WHERE "sizePricing" IS NULL OR "colorPricing" IS NULL
    `);
    
    console.log('Default pricing data updated!');
    
    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_products_size_pricing ON products USING GIN("sizePricing");
      CREATE INDEX IF NOT EXISTS idx_products_color_pricing ON products USING GIN("colorPricing");
    `);
    
    console.log('Indexes created!');
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
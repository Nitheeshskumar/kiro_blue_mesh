require('dotenv').config();
const { Pool } = require('pg');

async function checkSchema() {
  const pool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position
    `);
    
    console.log('Products table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check if we have any products with the new pricing columns
    const productCheck = await pool.query(`
      SELECT id, name, "basePrice", "sizePricing", "colorPricing"
      FROM products 
      LIMIT 3
    `);
    
    console.log('\nSample products with pricing:');
    productCheck.rows.forEach(row => {
      console.log(`- ${row.name}: Base ₹${row.basePrice}`);
      console.log(`  Size pricing: ${JSON.stringify(row.sizePricing)}`);
      console.log(`  Color pricing: ${JSON.stringify(row.colorPricing)}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
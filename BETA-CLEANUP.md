# Beta Database Cleanup Guide

This guide explains how to safely reset the database for the Willowbrook Clothing beta phase.

## Why Clean the Database?

Since the website is still in beta and not live, cleaning the database ensures:
- All new products follow the current data structure
- No legacy data conflicts with new features
- Clean slate for testing new functionality
- Consistent data format across all tables

## What Gets Cleaned

### ❌ Data That Will Be Removed:
- **Products**: All product entries and their data
- **Orders**: All customer orders and order items
- **Customizations**: All product customizations
- **Reviews**: All customer reviews and review photos
- **Measurements**: All saved customer measurements
- **Preferences**: All customization preferences

### ✅ Data That Will Be Preserved:
- **Users**: All user accounts (customers and admins)
- **Categories**: All product categories
- **Database Schema**: All table structures and relationships

## How to Run the Cleanup

### Option 1: Quick Reset (Recommended)
```bash
npm run reset-beta
```

### Option 2: Manual Cleanup
```bash
npm run cleanup-db
```

### Option 3: Direct Script
```bash
node cleanup-database.js
```

## Safety Features

The cleanup script includes several safety measures:

1. **Transaction Safety**: All operations run in a database transaction
2. **Rollback on Error**: If anything fails, all changes are rolled back
3. **Foreign Key Respect**: Deletes data in the correct order to avoid constraint violations
4. **Before/After Counts**: Shows exactly what was removed
5. **Detailed Logging**: Clear progress indicators and error messages

## What Happens During Cleanup

The script follows this order to respect database relationships:

1. **Review Photos** → Deleted first (references reviews)
2. **Customer Reviews** → Deleted next
3. **Order Items** → Deleted (references orders and products)
4. **Orders** → Deleted next
5. **Customizations** → Deleted (references products and users)
6. **Customer Measurements** → Deleted
7. **Customization Preferences** → Deleted
8. **Products** → Deleted last
9. **Category Counts** → Reset to 0

## After Cleanup

Once the cleanup is complete:

1. **Add New Products**: Use the admin panel to add products with the current structure
2. **Test Features**: All new products will follow the latest data format
3. **Verify Categories**: Product categories remain intact for organization
4. **User Accounts**: All user accounts remain functional

## Example Output

```
🔗 Connected to Supabase database
📝 Starting database cleanup transaction...

📊 Current database state:
   users: 5 records
   product_categories: 8 records
   products: 12 records
   orders: 3 records
   order_items: 7 records
   customizations: 15 records
   customer_reviews: 2 records

🧹 Starting cleanup process...
   ✓ Deleted 0 review photos
   ✓ Deleted 2 customer reviews
   ✓ Deleted 7 order items
   ✓ Deleted 3 orders
   ✓ Deleted 15 customizations
   ✓ Deleted 0 customer measurements
   ✓ Deleted 0 customization preferences
   ✓ Deleted 12 products
   ✓ Reset all category product counts to 0

✅ Database cleanup completed successfully!

📊 Database state after cleanup:
   users: 5 records
   product_categories: 8 records
   products: 0 records
   orders: 0 records
   order_items: 0 records
   customizations: 0 records
   customer_reviews: 0 records

🎉 Beta database reset complete!
```

## Recovery

If you need to restore data after cleanup:

1. **No Automatic Recovery**: The cleanup is permanent
2. **Re-add Products**: Use the admin panel to add products again
3. **Fresh Start**: This is intended for a clean beta reset

## When to Use

- Before major feature releases
- When data structure changes significantly
- For beta testing phases
- When you need a clean development environment

## Important Notes

⚠️ **This is a destructive operation** - make sure you want to remove all product and order data before running.

✅ **Safe for Beta** - Since the site isn't live, this won't affect real customers.

🔄 **Reversible Setup** - You can always re-add products and categories through the admin panel.

## Support

If you encounter any issues during cleanup:

1. Check the error messages in the console
2. Verify your database connection settings
3. Ensure you have proper database permissions
4. Contact the development team if problems persist
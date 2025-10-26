# Supabase Database Setup Guide

This guide provides instructions for setting up the Supabase database for the Willowbrook Clothing application migration from Neon PostgreSQL to Supabase.

## Files Overview

- `supabase-schema.sql` - Complete database schema with tables, indexes, constraints, and RLS policies
- `supabase-sample-data.sql` - Sample data for development and testing
- `supabase-validation.sql` - Validation queries to verify setup
- `setup-supabase-database.js` - Automated setup script
- `SUPABASE-SETUP-README.md` - This documentation file

## Prerequisites

1. **Supabase Project**: Create a new project in [Supabase Dashboard](https://app.supabase.com)
2. **Database URL**: Get your PostgreSQL connection string from Supabase project settings
3. **Node.js**: Ensure Node.js is installed for running the setup script
4. **PostgreSQL Client**: The `pg` package should be installed (`npm install pg`)

## Environment Variables

Set up your Supabase connection string in your environment:

```bash
# Option 1: Use SUPABASE_DATABASE_URL
export SUPABASE_DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Option 2: Use DATABASE_URL (for compatibility)
export DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Additional Supabase environment variables (for application use)
export SUPABASE_URL="https://[project-ref].supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Setup Methods

### Method 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
node setup-supabase-database.js
```

This script will:
1. Test the database connection
2. Create all tables, indexes, and constraints
3. Set up Row Level Security (RLS) policies
4. Insert sample data
5. Validate the setup
6. Provide a summary report

### Method 2: Manual Setup

If you prefer to run the SQL scripts manually:

1. **Create Schema**:
   ```bash
   psql $SUPABASE_DATABASE_URL -f supabase-schema.sql
   ```

2. **Insert Sample Data**:
   ```bash
   psql $SUPABASE_DATABASE_URL -f supabase-sample-data.sql
   ```

3. **Validate Setup**:
   ```bash
   psql $SUPABASE_DATABASE_URL -f supabase-validation.sql
   ```

### Method 3: Supabase Dashboard

You can also copy and paste the SQL content directly into the Supabase SQL Editor:

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the content from `supabase-schema.sql` and execute
4. Copy the content from `supabase-sample-data.sql` and execute
5. Copy the content from `supabase-validation.sql` and execute to verify

## Database Schema Overview

### Core Tables

1. **users** - User accounts (customers and admins)
2. **product_categories** - Product categorization
3. **products** - Product catalog with customization options
4. **customizations** - Customer product customizations
5. **orders** - Order management and tracking
6. **order_items** - Individual items within orders
7. **customer_reviews** - Product reviews and ratings
8. **review_photos** - Photos attached to reviews
9. **customer_measurements** - Saved customer measurements
10. **customization_preferences** - Customer preferences

### Key Features

- **Row Level Security (RLS)**: Enabled on all tables with appropriate policies
- **Foreign Key Constraints**: Proper relationships between tables
- **Indexes**: Optimized for common query patterns
- **Triggers**: Automatic timestamp updates
- **Views**: Helper views for statistics and summaries
- **JSON Support**: JSONB fields for flexible data storage

### Sample Data Included

- **7 Product Categories**: Mother & Daughter, Birthday Celebration, Cotton Essentials, etc.
- **6 Sample Products**: T-shirts, hoodies, caps, dresses, baby clothes
- **4 Users**: 1 admin + 3 customers
- **3 Orders**: With different statuses (delivered, shipped, processing)
- **4 Reviews**: With photos and ratings
- **Sample Customizations**: Product customizations with pricing

## Validation and Testing

After setup, the validation script checks:

- ✅ All 10 tables exist
- ✅ Proper column structures
- ✅ Foreign key constraints
- ✅ Indexes for performance
- ✅ Update triggers
- ✅ Helper views
- ✅ RLS policies
- ✅ Sample data integrity
- ✅ JSON data structures
- ✅ Array operations

## Security Configuration

### Row Level Security Policies

The setup includes RLS policies for:

- **Users**: Can view/edit own profile, admins can view all
- **Products**: Public read access for active products
- **Orders**: Users can manage own orders
- **Reviews**: Public read, users can manage own reviews
- **Customizations**: Users can manage own customizations

### Authentication Integration

The RLS policies are designed to work with Supabase Auth:
- Uses `auth.uid()` for user identification
- Supports role-based access (CUSTOMER/ADMIN)
- Protects sensitive user data

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify your SUPABASE_DATABASE_URL is correct
   - Check if your IP is allowed in Supabase project settings
   - Ensure the password is properly URL-encoded

2. **Permission Denied**
   - Make sure you're using the service role key for database operations
   - Check if RLS policies are properly configured

3. **Table Already Exists**
   - This is normal if re-running the setup
   - The scripts use `IF NOT EXISTS` and `ON CONFLICT` to handle this

4. **Missing Dependencies**
   - Install required packages: `npm install pg`
   - Ensure Node.js version compatibility

### Validation Failures

If validation fails:

1. Check the specific error messages
2. Verify all SQL scripts ran successfully
3. Check Supabase project logs
4. Re-run individual scripts if needed

## Migration from Neon

When migrating from Neon PostgreSQL:

1. **Backup Current Data**: Export your Neon database
2. **Set Up Supabase**: Run this setup process
3. **Data Migration**: Import your actual data (replace sample data)
4. **Update Application**: Change connection strings to Supabase
5. **Test Thoroughly**: Verify all functionality works

## Performance Considerations

The setup includes optimizations for:

- **Query Performance**: Indexes on frequently queried columns
- **Serverless Functions**: Connection pooling configuration
- **JSON Operations**: GIN indexes for JSONB columns
- **Array Operations**: Proper indexing for array columns

## Support and Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Next Steps

After successful setup:

1. Update your application's environment variables
2. Test database connectivity from your application
3. Run your application's test suite
4. Deploy with the new Supabase configuration
5. Monitor performance and optimize as needed

---

**Note**: This setup creates a development-ready database. For production use, review and adjust the RLS policies, indexes, and security settings according to your specific requirements.
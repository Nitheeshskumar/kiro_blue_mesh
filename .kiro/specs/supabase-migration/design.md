# Design Document - Supabase Migration

## Overview

This design outlines the migration from Neon PostgreSQL to Supabase for Willowbrook Clothing's database infrastructure. The migration will replace the current Neon database connection with Supabase while maintaining all existing functionality and improving the developer experience with additional features like real-time subscriptions, built-in authentication, and enhanced tooling.

## Architecture

### Current Architecture (Neon)
```
Netlify Functions → Custom Database Layer → Neon PostgreSQL
                 ↓
            Connection Pool (pg)
```

### Target Architecture (Supabase)
```
Netlify Functions → Enhanced Database Layer → Supabase PostgreSQL
                 ↓                        ↓
            Connection Pool (pg)    Supabase Client (optional)
```

### Migration Strategy
- **Phased Approach**: Migrate database connection first, then optionally enhance with Supabase-specific features
- **Backward Compatibility**: Maintain existing API contracts and database operations
- **Zero Downtime**: Use database export/import for seamless transition

## Components and Interfaces

### 1. Database Connection Layer

#### Current Implementation
```typescript
// netlify/functions/lib/database.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Neon connection
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

#### Enhanced Implementation
```typescript
// netlify/functions/lib/database.ts
const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Optional: Supabase client for enhanced features
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)
```

### 2. Environment Configuration

#### New Environment Variables
```bash
# Supabase Configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Legacy (to be removed after migration)
DATABASE_URL="postgresql://neondb_owner:..."
```

### 3. Database Schema Migration

#### Schema Compatibility
- **PostgreSQL Compatibility**: Supabase uses standard PostgreSQL, ensuring full compatibility
- **Data Types**: All existing JSONB, TEXT[], and custom types are supported
- **Constraints**: Foreign keys, indexes, and constraints will be preserved

#### Migration Process
```sql
-- Export from Neon
pg_dump $NEON_DATABASE_URL > willowbrook_backup.sql

-- Import to Supabase
psql $SUPABASE_DATABASE_URL < willowbrook_backup.sql
```

### 4. Enhanced Database Layer

#### Core Database Class (Maintained)
```typescript
export class Database {
  private pool: Pool
  private supabase?: SupabaseClient // Optional enhancement

  constructor() {
    this.pool = getPool()
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
      )
    }
  }

  // All existing methods remain unchanged
  async findUserByEmail(email: string): Promise<User | null> { ... }
  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> { ... }
  // ... all other existing methods
}
```

#### Optional Supabase Enhancements
```typescript
// Real-time subscriptions (future enhancement)
async subscribeToOrderUpdates(userId: string, callback: (order: Order) => void) {
  if (!this.supabase) return null
  
  return this.supabase
    .channel('order-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: `userId=eq.${userId}`
    }, callback)
    .subscribe()
}

// Enhanced authentication (future enhancement)
async authenticateWithSupabase(token: string) {
  if (!this.supabase) return null
  return await this.supabase.auth.getUser(token)
}
```

## Data Models

### Existing Schema (Preserved)
All current tables and relationships will be maintained:

- `users` - User accounts and authentication
- `product_categories` - Product categorization
- `products` - Product catalog with customization options
- `customizations` - User customization configurations
- `orders` - Order management and tracking
- `order_items` - Order line items
- `customer_reviews` - Product reviews and ratings
- `review_photos` - Review image attachments
- `customer_measurements` - Saved customer measurements
- `customization_preferences` - User preferences

### Enhanced Schema (Optional Future Additions)
```sql
-- Real-time notifications (future enhancement)
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(255) PRIMARY KEY,
  "userId" VARCHAR(255) REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log (future enhancement)
CREATE TABLE IF NOT EXISTS audit_log (
  id VARCHAR(255) PRIMARY KEY,
  table_name VARCHAR(255) NOT NULL,
  operation VARCHAR(10) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  "userId" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

### Connection Management
```typescript
// Enhanced error handling for Supabase connections
function getPool(): Pool {
  if (!pool) {
    try {
      pool = new Pool({
        connectionString: process.env.SUPABASE_DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })

      // Connection event handlers
      pool.on('error', (err) => {
        console.error('Supabase connection pool error:', err)
      })

      pool.on('connect', () => {
        console.log('Connected to Supabase database')
      })

    } catch (error) {
      console.error('Failed to create Supabase connection pool:', error)
      throw new Error('Database connection failed')
    }
  }
  return pool
}
```

### Migration Validation
```typescript
// Database migration validation
async validateMigration(): Promise<boolean> {
  try {
    // Check table existence
    const tables = ['users', 'products', 'orders', 'customizations']
    for (const table of tables) {
      const result = await this.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table])
      
      if (!result.rows[0].exists) {
        throw new Error(`Table ${table} not found`)
      }
    }

    // Validate data integrity
    const userCount = await this.countUsers()
    const productCount = await this.countProducts()
    
    console.log(`Migration validation: ${userCount} users, ${productCount} products`)
    return true
  } catch (error) {
    console.error('Migration validation failed:', error)
    return false
  }
}
```

## Testing Strategy

### 1. Pre-Migration Testing
- **Data Export Validation**: Verify complete data export from Neon
- **Schema Compatibility**: Test schema creation in Supabase
- **Connection Testing**: Validate Supabase connection parameters

### 2. Migration Testing
- **Data Integrity**: Compare record counts and data consistency
- **Functional Testing**: Test all CRUD operations
- **Performance Testing**: Validate query performance

### 3. Post-Migration Testing
- **End-to-End Testing**: Full application workflow testing
- **Load Testing**: Verify performance under load
- **Rollback Testing**: Ensure rollback procedures work

### Test Implementation
```typescript
// Migration test suite
describe('Supabase Migration', () => {
  let db: Database

  beforeAll(async () => {
    db = await getDatabase()
  })

  test('should connect to Supabase', async () => {
    const result = await db.query('SELECT 1 as test')
    expect(result.rows[0].test).toBe(1)
  })

  test('should preserve all user data', async () => {
    const users = await db.getAllUsers()
    expect(users.length).toBeGreaterThan(0)
  })

  test('should maintain product catalog', async () => {
    const products = await db.findProducts({ isActive: true })
    expect(products.length).toBeGreaterThan(0)
  })

  test('should preserve order history', async () => {
    const orders = await db.findOrders()
    expect(orders).toBeDefined()
  })
})
```

## Migration Timeline

### Phase 1: Preparation (Day 1)
1. Set up Supabase project
2. Configure environment variables
3. Export Neon database schema and data
4. Create Supabase database structure

### Phase 2: Migration (Day 2)
1. Import data to Supabase
2. Update database connection configuration
3. Deploy updated application
4. Validate functionality

### Phase 3: Optimization (Day 3-5)
1. Performance tuning
2. Optional Supabase feature integration
3. Documentation updates
4. Team training

## Rollback Strategy

### Immediate Rollback
- Revert environment variables to Neon configuration
- Redeploy previous application version
- Validate Neon database connectivity

### Data Synchronization
- Maintain Neon database during transition period
- Implement data sync if rollback needed after extended use
- Document rollback procedures

## Documentation Updates

### Steering Documents
1. **tech.md**: Update database provider from Neon to Supabase
2. **structure.md**: Update database layer documentation
3. **product.md**: Add Supabase-specific features if implemented

### Development Documentation
- Update setup instructions for Supabase
- Document new environment variables
- Update deployment procedures
- Create troubleshooting guide

## Security Considerations

### Connection Security
- Use SSL connections in production
- Implement connection pooling limits
- Secure environment variable management

### Access Control
- Use Supabase service role key for server operations
- Implement row-level security if needed
- Regular security audits

### Data Protection
- Encrypt sensitive data at rest
- Implement backup procedures
- Monitor access logs

## Performance Optimization

### Connection Pooling
- Optimize pool size for serverless functions
- Implement connection retry logic
- Monitor connection metrics

### Query Optimization
- Maintain existing indexes
- Optimize for Supabase-specific features
- Implement query caching where appropriate

### Monitoring
- Set up Supabase monitoring
- Track query performance
- Monitor connection health
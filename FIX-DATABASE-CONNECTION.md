# 🔧 Fix Database Connection Error

## ❌ Current Error
```
ERROR Database initialization error: Error: getaddrinfo ENOTFOUND db.frbdhevxgofuvnrcbcvi.supabase.co
```

**Cause**: Incorrect database URL format or missing environment variable in Netlify.

## ✅ Solution: Update Database URL

### Step 1: Get Correct Supabase Database URL

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/frbdhevxgofuvnrcbcvi
2. **Navigate to**: Settings → Database
3. **Copy the Connection String** under "Connection parameters"

The correct format should be:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Step 2: Update Netlify Environment Variable

**In Netlify Dashboard** → Site settings → Environment variables:

**Replace**:
```env
SUPABASE_DATABASE_URL=postgresql://postgres:gXUEUGLkJmHbdO6o@db.frbdhevxgofuvnrcbcvi.supabase.co:5432/postgres
```

**With the correct URL from Supabase Dashboard** (something like):
```env
SUPABASE_DATABASE_URL=postgresql://postgres.frbdhevxgofuvnrcbcvi:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### Step 3: Alternative - Use Direct Connection

If pooler doesn't work, try the direct connection:
```env
SUPABASE_DATABASE_URL=postgresql://postgres:[password]@db.frbdhevxgofuvnrcbcvi.supabase.co:5432/postgres?sslmode=require
```

### Step 4: Verify SSL Configuration

Make sure SSL is properly configured for production. Update the database connection:

```typescript
// In netlify/functions/lib/database.ts
pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout
})
```

## 🧪 Testing Steps

### Step 1: Test Connection Locally
```bash
# Test the connection string locally
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'your-supabase-url-here',
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? 'Error:' + err : 'Success:' + res.rows[0]);
  pool.end();
});
"
```

### Step 2: Check Netlify Function Logs
After updating the environment variable:
1. Trigger a new deployment
2. Try logging in again
3. Check function logs for connection success/failure

## 🚨 Common Issues & Solutions

### Issue 1: Wrong Database URL Format
**Fix**: Get the exact URL from Supabase Dashboard → Settings → Database

### Issue 2: SSL Certificate Issues
**Fix**: Add `?sslmode=require` to the connection string

### Issue 3: Connection Timeout
**Fix**: Increase `connectionTimeoutMillis` to 10000 or higher

### Issue 4: Firewall/Network Issues
**Fix**: Ensure Netlify can access Supabase (usually not an issue)

## 📋 Environment Variables Checklist

Ensure these are ALL set correctly in Netlify:

```env
# Database Connection (CRITICAL - get from Supabase Dashboard)
SUPABASE_DATABASE_URL=postgresql://postgres.frbdhevxgofuvnrcbcvi:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Supabase API (for Storage/Auth)
SUPABASE_URL=https://frbdhevxgofuvnrcbcvi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
JWT_SECRET=willowbrook-clothing-jwt-secret-key-12345

# Client-side
VITE_API_URL=/.netlify/functions/api
VITE_SUPABASE_URL=https://frbdhevxgofuvnrcbcvi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_NAME=Willowbrook Clothing
```

## 🎯 Quick Fix Steps

1. **Get correct database URL** from Supabase Dashboard
2. **Update SUPABASE_DATABASE_URL** in Netlify environment variables
3. **Redeploy** (automatic after env var change)
4. **Test login** again
5. **Check function logs** for success

---

**Most likely fix**: The database URL format is incorrect. Get the exact connection string from your Supabase project settings!
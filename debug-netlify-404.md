# 🔍 Debug Netlify 404 Error

## ❌ Current Issue
**Problem**: Getting 404 errors when calling Netlify Functions  
**URL Pattern**: `https://your-site.netlify.app/.netlify/functions/api/auth/login` → 404  
**Expected**: Should reach the auth route in Netlify Functions

## 🧪 Diagnostic Steps

### Step 1: Check Function Deployment Status

1. **Go to Netlify Dashboard** → Your Site → Functions tab
2. **Verify functions are deployed**:
   - Should see `api` function listed
   - Check if it shows any errors
   - Look at function logs

### Step 2: Test Function Directly

Try accessing the function directly in browser:
```
https://your-site.netlify.app/.netlify/functions/api/health
```

**Expected Response**:
```json
{"status":"OK","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Step 3: Check Build Logs

1. **Go to Netlify Dashboard** → Deploys → Latest Deploy
2. **Check build logs** for:
   - Function compilation errors
   - TypeScript errors
   - Missing dependencies
   - Build failures

### Step 4: Verify Environment Variables

Ensure these are set in Netlify:
```env
SUPABASE_URL=https://frbdhevxgofuvnrcbcvi.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
JWT_SECRET=willowbrook-clothing-jwt-secret-key-12345
```

## 🔧 Common Fixes

### Fix 1: Function Build Issues

If functions aren't building, check `netlify/functions/package.json`:

```json
{
  "name": "willowbrook-netlify-functions",
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "@netlify/functions": "^2.0.0",
    "express": "^4.18.2",
    "serverless-http": "^3.2.0"
  }
}
```

### Fix 2: Update netlify.toml

Ensure correct configuration:

```toml
[build]
  command = "npm run build:netlify"
  functions = "netlify/functions"
  publish = "client/dist"

[functions]
  node_bundler = "esbuild"
  external_node_modules = ["express", "serverless-http"]

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

### Fix 3: Manual Function Test

Create a simple test function to verify deployment:

```typescript
// netlify/functions/test.ts
import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Test function works!',
      method: event.httpMethod,
      path: event.path
    })
  }
}
```

Test at: `https://your-site.netlify.app/.netlify/functions/test`

### Fix 4: Check Function Size

Large functions may fail to deploy:
- Check if dependencies are too large
- Verify external_node_modules in netlify.toml
- Consider splitting large functions

## 🚨 Emergency Workaround

If functions still don't work, temporarily use a different API approach:

### Option 1: Use Supabase Edge Functions
Deploy your API as Supabase Edge Functions instead of Netlify Functions.

### Option 2: Use External API Service
Deploy your backend to Railway, Render, or Vercel.

### Option 3: Client-Side Only Mode
Temporarily disable server-side features and use only client-side Supabase operations.

## 📋 Debugging Checklist

- [ ] Functions appear in Netlify Dashboard
- [ ] Build logs show successful function compilation
- [ ] Environment variables are set correctly
- [ ] Test function responds at `/.netlify/functions/api/health`
- [ ] No TypeScript compilation errors
- [ ] Dependencies are properly installed
- [ ] netlify.toml configuration is correct
- [ ] Function size is under limits

## 🎯 Next Steps

1. **Check Netlify Dashboard** for function deployment status
2. **Test health endpoint** directly
3. **Review build logs** for errors
4. **Verify environment variables**
5. **Try manual function deployment** if needed

---

**Most Common Cause**: Missing environment variables causing functions to crash on startup, resulting in 404 instead of 500 errors.
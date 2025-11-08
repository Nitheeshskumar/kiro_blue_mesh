# Debugging Login 500 Error

## The Error You're Seeing

```json
{
  "error": "Route not found",
  "method": "POST",
  "path": "/",
  "url": "/",
  "originalUrl": "/api/auth/login"
}
```

This means the request is reaching the API function, but Express is seeing the path as `/` instead of `/auth/login`.

## Root Cause

The issue is in how `serverless-http` processes the path when running with Netlify Dev vs. direct function invocation.

## Solution Applied

Updated `netlify/functions/api.ts` to properly extract the path:

```typescript
// Remove /.netlify/functions/api prefix
let modifiedPath = event.path
if (modifiedPath.startsWith('/.netlify/functions/api')) {
  modifiedPath = modifiedPath.replace('/.netlify/functions/api', '')
}

// Ensure path starts with /
if (!modifiedPath.startsWith('/')) {
  modifiedPath = '/' + modifiedPath
}
```

## Testing Steps

### 1. Test Direct Function (Works ✅)

```bash
npm run test-routing
```

This tests the function directly and should show:
- ✓ Health check works
- ✓ Login works

### 2. Test with Netlify Dev

First, start Netlify Dev:

```bash
npm run dev:netlify
```

Then in another terminal:

```bash
node test-netlify-dev.js
```

### 3. Test with Full App

```bash
npm run dev
```

Then open `http://localhost:8888` and try to login.

## If Still Not Working

### Check 1: Verify Environment Variables

```bash
# In client/.env
VITE_API_URL=http://localhost:8888/api
```

### Check 2: Check Netlify Dev Logs

When you try to login, check the terminal running `npm run dev:netlify` for logs showing:

```
Netlify Function called: { httpMethod: 'POST', path: '...' }
Path transformation: { original: '...', modified: '...' }
```

### Check 3: Browser Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Check the request:
   - URL should be: `http://localhost:8888/api/auth/login`
   - Method: POST
   - Status: Should be 200, not 404 or 500

### Check 4: Rebuild Functions

```bash
npm run build:functions
```

Then restart Netlify Dev.

## Alternative: Use Simple API

If the Express routing continues to have issues, you can temporarily use the simple API:

1. In `netlify.toml`, change:
   ```toml
   from = "/api/*"
   to = "/.netlify/functions/api-simple/:splat"
   ```

2. Rebuild and restart

## Quick Fix Command

```bash
npm run fix-login
```

This will:
1. Rebuild functions
2. Reset admin password
3. Test login

## Still Having Issues?

Check these files:
- `netlify/functions/api.ts` - Main API handler
- `netlify.toml` - Redirect configuration
- `client/.env` - API URL configuration
- Browser console for errors
- Netlify Dev terminal for logs

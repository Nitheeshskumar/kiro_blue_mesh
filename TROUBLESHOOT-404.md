# 🚨 Troubleshoot Netlify 404 Error

## 🔍 Current Situation
- ✅ Functions build successfully (`npm run build:netlify` works)
- ✅ Environment variable `VITE_API_URL=/.netlify/functions/api` is set
- ❌ Getting 404 errors when calling API endpoints
- ❌ Functions may not be deploying or accessible

## 🧪 Step-by-Step Diagnosis

### Step 1: Test Simple Function First

I've created a test function. After your next deployment, try:
```
https://your-site.netlify.app/.netlify/functions/test
```

This should return:
```json
{
  "message": "Test function is working!",
  "timestamp": "...",
  "environment": {...}
}
```

### Step 2: Test Main API Health Endpoint

Try the health check:
```
https://your-site.netlify.app/.netlify/functions/api/health
```

Expected response:
```json
{"status":"OK","timestamp":"..."}
```

### Step 3: Check Netlify Dashboard

1. **Go to**: https://app.netlify.com/sites/[your-site]/functions
2. **Look for**:
   - `api` function (should be listed)
   - `test` function (should be listed)
   - Any error messages or deployment issues

### Step 4: Check Function Logs

1. **In Netlify Dashboard**: Go to Functions → Click on `api` function
2. **Check logs** for:
   - Invocation errors
   - Runtime errors
   - Missing environment variables
   - Timeout issues

## 🔧 Potential Fixes

### Fix 1: Redeploy with Correct Build Command

Make sure your Netlify build settings are:
```
Build command: npm run build:netlify
Publish directory: client/dist
Functions directory: netlify/functions
```

### Fix 2: Check netlify.toml Configuration

Verify your `netlify.toml` has:
```toml
[build]
  command = "npm run build:netlify"
  functions = "netlify/functions"
  publish = "client/dist"

[build.environment]
  NODE_VERSION = "20.12.2"

[functions]
  node_bundler = "esbuild"
  external_node_modules = ["express", "serverless-http", "bcryptjs", "jsonwebtoken", "stripe", "pg", "@supabase/supabase-js"]

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Fix 3: Environment Variables Check

Ensure ALL these are set in Netlify:
```env
# Critical for functions to work
SUPABASE_URL=https://frbdhevxgofuvnrcbcvi.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
JWT_SECRET=willowbrook-clothing-jwt-secret-key-12345

# Client-side variables
VITE_API_URL=/.netlify/functions/api
VITE_SUPABASE_URL=https://frbdhevxgofuvnrcbcvi.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=Willowbrook Clothing
```

### Fix 4: Manual Deployment Test

Try deploying manually:
```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Login and link to your site
netlify login
netlify link

# Build and deploy
npm run build:netlify
netlify deploy --prod
```

### Fix 5: Check Function Size and Dependencies

Large functions may fail to deploy:
```bash
# Check function size
cd netlify/functions/dist
ls -la

# If api.js is very large (>50MB), there might be bundling issues
```

## 🚨 Common Issues & Solutions

### Issue 1: Functions Not Appearing in Dashboard
**Cause**: Build failure or incorrect functions directory  
**Fix**: Check build logs, verify `netlify.toml` functions path

### Issue 2: Functions Crash on Startup
**Cause**: Missing environment variables  
**Fix**: Add all required environment variables

### Issue 3: Import/Dependency Issues
**Cause**: Missing external_node_modules in netlify.toml  
**Fix**: Add all Node.js dependencies to external_node_modules list

### Issue 4: Database Connection Fails
**Cause**: Incorrect database URL or missing credentials  
**Fix**: Verify Supabase connection string and credentials

## 🎯 Quick Debug Commands

### Test Local Functions (if you have Netlify CLI):
```bash
# Install dependencies
cd netlify/functions && npm install

# Test locally
netlify dev

# This should start functions at http://localhost:8888/.netlify/functions/
```

### Test API Endpoints Locally:
```bash
# Test health endpoint
curl http://localhost:8888/.netlify/functions/api/health

# Test auth endpoint
curl -X POST http://localhost:8888/.netlify/functions/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

## 📋 Debugging Checklist

- [ ] Test function responds: `/.netlify/functions/test`
- [ ] Health endpoint responds: `/.netlify/functions/api/health`
- [ ] Functions appear in Netlify Dashboard
- [ ] No errors in function logs
- [ ] All environment variables are set
- [ ] Build completes without errors
- [ ] netlify.toml is configured correctly
- [ ] Function size is reasonable (<50MB)

## 🆘 If Nothing Works

### Temporary Workaround Options:

1. **Use Supabase Auth directly** (bypass custom auth functions)
2. **Deploy backend separately** (Railway, Render, Vercel)
3. **Use client-side only** approach temporarily
4. **Contact Netlify support** if functions consistently fail

---

**Next Action**: Test the simple function first, then check Netlify Dashboard for function deployment status.
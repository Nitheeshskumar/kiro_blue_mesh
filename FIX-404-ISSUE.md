# 🔧 Fix 404 API Issue - Step by Step

## The Problem
Your Netlify deployment is successful, but API calls return 404 Not Found when trying to login.

## Root Cause
The issue is likely one of these:
1. **Functions not deploying properly**
2. **Environment variables missing**
3. **Routing configuration issue**
4. **Build process not including functions**

## ✅ Step-by-Step Fix

### Step 1: Verify Functions Are Deployed

Visit these URLs on your deployed site (replace `your-site` with your actual Netlify URL):

**Test basic function:**
```
https://your-site.netlify.app/.netlify/functions/test
```
**Expected:** `{"message":"Test function working!",...}`
**If 404:** Functions aren't deploying at all

**Test debug function:**
```
https://your-site.netlify.app/.netlify/functions/debug
```
**Expected:** Debug information in JSON format
**If 404:** Functions aren't deploying at all

**Test API health:**
```
https://your-site.netlify.app/.netlify/functions/api/health
```
**Expected:** `{"status":"OK","timestamp":"..."}`
**If 404:** Main API function isn't working

### Step 2: Check Netlify Dashboard

1. **Go to your Netlify site dashboard**
2. **Click "Functions" tab**
3. **You should see functions like:**
   - `api`
   - `test` 
   - `debug`

**If no functions are listed:** The build process isn't including them.

### Step 3: Fix Build Configuration

In your Netlify site settings:

1. **Go to Site Settings > Build & Deploy**
2. **Set these exact values:**
   - **Build command:** `npm run build:netlify`
   - **Publish directory:** `client/dist`
   - **Functions directory:** `netlify/functions`

3. **Clear cache and redeploy:**
   - Go to Deploys tab
   - Click "Trigger deploy" > "Clear cache and deploy site"

### Step 4: Set Environment Variables

In Netlify Dashboard > Site Settings > Environment Variables:

**Required variables:**
```
JWT_SECRET = your-super-secret-jwt-key-here-make-it-long-and-random
CLIENT_URL = https://your-site.netlify.app
NODE_VERSION = 18
```

**Optional:**
```
STRIPE_SECRET_KEY = sk_test_... (if using payments)
```

### Step 5: Test Login API Directly

Once functions are working, test the login endpoint:

**URL:** `https://your-site.netlify.app/.netlify/functions/api/auth/login`
**Method:** POST
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "email": "admin@willowbrook.com",
  "password": "secret123"
}
```

**Expected response:** Login success with user data and token
**If still 404:** Check function logs in Netlify dashboard

### Step 6: Check Function Logs

1. **Go to Netlify Dashboard > Functions**
2. **Click on the `api` function**
3. **Look for error messages or logs**
4. **Common issues:**
   - Import errors
   - Missing dependencies
   - Runtime errors

### Step 7: Verify Client API Configuration

Make sure your client is making requests to the right URL:

**Check `client/src/lib/api.ts`:**
```typescript
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // ...
})
```

**This should be correct** - it will use `/api` which gets redirected to `/.netlify/functions/api`

## 🚨 Common Issues & Fixes

### Issue 1: "Function not found" in Netlify
**Fix:** Check build logs for compilation errors
- Go to Deploys > Latest deploy > View function logs
- Look for TypeScript or import errors

### Issue 2: Functions deploy but return 500 errors
**Fix:** Check function runtime logs
- Missing environment variables (especially JWT_SECRET)
- Import path issues

### Issue 3: CORS errors in browser
**Fix:** Set CLIENT_URL environment variable to your exact Netlify URL

### Issue 4: Routes not matching
**Fix:** The API function has middleware to handle `/api` prefix removal

## 🔍 Debug Commands

**Test locally first:**
```bash
npm run test:functions
npm run prepare:netlify
```

**Check what's being deployed:**
1. Look at `netlify/functions/` folder
2. Verify all route files exist
3. Check `netlify/functions/package.json` has dependencies

## 📞 If Still Not Working

1. **Share the exact error message** from browser dev tools
2. **Share the Netlify function logs** from dashboard
3. **Confirm which test URLs return 404**

The most common fix is setting the environment variables correctly and ensuring the build process includes the functions directory.

---

## 🎯 Quick Test Checklist

- [ ] `/.netlify/functions/test` returns JSON (not 404)
- [ ] `/.netlify/functions/debug` returns JSON (not 404)  
- [ ] `/.netlify/functions/api/health` returns `{"status":"OK"}`
- [ ] JWT_SECRET environment variable is set
- [ ] CLIENT_URL environment variable matches your site URL
- [ ] Functions appear in Netlify dashboard
- [ ] Build logs show no errors

Once all these pass, your login should work! 🎉
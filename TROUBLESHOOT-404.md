# 🔧 Troubleshooting 404 API Errors on Netlify

## Issue: API returning 404 Not Found

This guide will help you diagnose and fix the 404 error when trying to login.

## Step 1: Test Basic Function Deployment

First, let's verify that Netlify Functions are working at all:

### Test the debug function:
Visit: `https://your-site.netlify.app/.netlify/functions/debug`

**Expected result**: Should return JSON with debug info
**If 404**: Functions aren't deploying properly

### Test the test function:
Visit: `https://your-site.netlify.app/.netlify/functions/test`

**Expected result**: Should return "Test function working!"
**If 404**: Functions aren't deploying properly

## Step 2: Check Netlify Function Logs

1. Go to your Netlify dashboard
2. Click on your site
3. Go to "Functions" tab
4. Look for the `api` function
5. Click on it to see logs

**What to look for:**
- Is the function listed?
- Are there any build errors?
- Are there runtime errors in the logs?

## Step 3: Test API Health Check

Visit: `https://your-site.netlify.app/.netlify/functions/api/health`

**Expected result**: `{"status":"OK","timestamp":"..."}`
**If 404**: The main API function isn't working

## Step 4: Test Login Endpoint Directly

Try making a POST request to:
`https://your-site.netlify.app/.netlify/functions/api/auth/login`

With body:
```json
{
  "email": "admin@willowbrook.com",
  "password": "secret123"
}
```

**Expected result**: Login success or error message
**If 404**: Routing issue in the API function

## Step 5: Check Environment Variables

In Netlify dashboard, go to Site Settings > Environment Variables:

**Required variables:**
- `JWT_SECRET` - Should be set to a secure random string
- `CLIENT_URL` - Should be your Netlify site URL
- `NODE_VERSION` - Should be 18 or 20

## Step 6: Common Fixes

### Fix 1: Redeploy with Correct Build Command

In Netlify dashboard:
1. Go to Site Settings > Build & Deploy
2. Set Build command to: `npm run build:netlify`
3. Set Publish directory to: `client/dist`
4. Set Functions directory to: `netlify/functions`
5. Trigger a new deploy

### Fix 2: Check Function File Structure

Your functions should be in:
```
netlify/functions/
├── api.ts
├── test.ts
├── debug.ts
├── lib/database.ts
├── routes/
└── middleware/
```

### Fix 3: Manual Function Test

Create a simple test in Netlify dashboard:
1. Go to Functions tab
2. Create a new function
3. Use this code:
```javascript
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({message: 'Hello World'})
  }
}
```

## Step 7: Debug Client Requests

Open browser dev tools and check:

1. **Network tab**: What URL is the login request going to?
2. **Console**: Any JavaScript errors?
3. **Request headers**: Is the request properly formatted?

**Common issues:**
- Request going to wrong URL
- CORS errors
- Missing headers

## Step 8: Check Netlify Redirects

The redirect rule should be:
```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

## Quick Fixes to Try

### 1. Update netlify.toml
Make sure your `netlify.toml` has:
```toml
[build]
  publish = "client/dist"
  command = "npm run build:netlify"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"
```

### 2. Rebuild and Redeploy
```bash
npm run build:netlify
# Then push to GitHub or manually deploy
```

### 3. Check Function Dependencies
Make sure `netlify/functions/package.json` has all required dependencies.

## If Still Not Working

1. **Check Netlify build logs** for any errors during function compilation
2. **Try deploying a minimal function** first to isolate the issue
3. **Check if the function size is too large** (Netlify has limits)
4. **Verify Node.js version compatibility**

## Contact Points

If none of these work:
1. Check Netlify community forums
2. Look at Netlify function documentation
3. Check if there are any service outages

---

**Most common cause**: Build process not including the functions properly or environment variables not set correctly.
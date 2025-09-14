# 🔧 Fix 404 API Error - Deployment Checklist

## ✅ The Key Fix Applied

The main issue was **URL path handling**. I've added middleware to the API function that removes the "/api" prefix:

```javascript
app.use((req, res, next) => {
  // Remove the "/api" prefix if present
  if (req.url.startsWith('/api')) {
    req.url = req.url.slice(4); // removes "/api"
  }
  next();
});
```

This should fix the 404 error you were experiencing.

## 🚀 Deployment Steps

### 1. **Push Updated Code to GitHub**
```bash
git add .
git commit -m "Fix API routing for Netlify Functions"
git push
```

### 2. **Redeploy on Netlify**
- Go to your Netlify dashboard
- Click "Trigger deploy" > "Deploy site"
- OR it should auto-deploy if connected to GitHub

### 3. **Set Environment Variables**
In Netlify dashboard > Site Settings > Environment Variables:

**Required:**
- `JWT_SECRET` = `your-super-secret-jwt-key-here-make-it-long-and-random`
- `CLIENT_URL` = `https://your-site-name.netlify.app`

**Optional:**
- `STRIPE_SECRET_KEY` = `sk_test_...` (if using payments)

### 4. **Test the Fixed API**

After deployment, test these URLs:

#### A. Test Basic Function
Visit: `https://your-site.netlify.app/.netlify/functions/test`
**Expected:** `{"message": "Test function working!"}`

#### B. Test API Health
Visit: `https://your-site.netlify.app/.netlify/functions/api/health`
**Expected:** `{"status":"OK","timestamp":"..."}`

#### C. Test Login API
POST to: `https://your-site.netlify.app/api/auth/login`
With body:
```json
{
  "email": "admin@willowbrook.com",
  "password": "secret123"
}
```
**Expected:** Login success with token

### 5. **Test Your App**

1. **Visit your site**: `https://your-site.netlify.app`
2. **Try to login** with: admin@willowbrook.com / secret123
3. **Browse products** - should see 3 sample items
4. **Create account** - register a new user
5. **Customize items** - pick colors, sizes

## 🔍 If Still Getting 404

### Check Netlify Function Logs
1. Netlify Dashboard > Functions tab
2. Click on "api" function
3. Look for error messages

### Check Build Logs
1. Netlify Dashboard > Deploys tab
2. Click latest deploy
3. Look for function compilation errors

### Verify Function Deployment
In Netlify Dashboard > Functions, you should see:
- ✅ `api` function
- ✅ `test` function  
- ✅ `debug` function

## 🎯 What Should Work Now

✅ **Login/Register** - Authentication endpoints  
✅ **Product Browsing** - 3 sample products included  
✅ **Customization** - Color/size selection  
✅ **Shopping Cart** - Add items to cart  
✅ **Order Placement** - Complete checkout  
✅ **Admin Dashboard** - Manage everything  

## 🆘 Emergency Debugging

If you're still getting 404s, try these URLs to isolate the issue:

1. `https://your-site.netlify.app/.netlify/functions/debug`
2. `https://your-site.netlify.app/.netlify/functions/api/health`
3. `https://your-site.netlify.app/api/health` (should redirect to above)

The first two should work. If the third doesn't work, there's a redirect issue.

## 📞 Quick Test Commands

You can test the API with curl:

```bash
# Test health check
curl https://your-site.netlify.app/api/health

# Test login
curl -X POST https://your-site.netlify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@willowbrook.com","password":"secret123"}'
```

---

**The key fix is the URL path middleware - this should resolve your 404 issue!** 🎉

Push the code and redeploy, then test the endpoints above.
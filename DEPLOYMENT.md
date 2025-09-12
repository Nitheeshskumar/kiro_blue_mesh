# Willowbrook Clothing - Deployment Guide

## 🚀 Netlify Deployment

### Quick Deploy

```bash
# Prepare for deployment
npm run deploy:netlify

# Deploy to Netlify (if CLI installed)
cd client
netlify deploy --prod --dir=dist
```

### Manual Deployment Steps

1. **Build the application:**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Deploy to Netlify:**
   - Drag the `client/dist` folder to [Netlify Drop](https://app.netlify.com/drop)
   - Or use Netlify CLI: `netlify deploy --prod --dir=client/dist`

3. **Configure environment variables in Netlify:**
   - `VITE_API_URL`: Your backend API URL
   - `VITE_STRIPE_PUBLIC_KEY`: Your Stripe public key
   - `VITE_APP_URL`: Your Netlify app URL

### Backend Deployment Options

#### Option 1: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd server
railway login
railway init
railway up
```

#### Option 2: Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd server && npm install && npm run build`
4. Set start command: `cd server && npm start`
5. Add environment variables

#### Option 3: Heroku
```bash
# Install Heroku CLI and login
heroku create willowbrook-api

# Deploy
cd server
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a willowbrook-api
git push heroku main
```

### Environment Variables

#### Client (.env.production)
```env
VITE_API_URL=https://your-backend-url.com/api
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
VITE_APP_NAME=Willowbrook Clothing
VITE_APP_URL=https://willowbrook-clothing.netlify.app
```

#### Server
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NODE_ENV=production
```

### Post-Deployment Checklist

- [ ] Frontend deployed to Netlify
- [ ] Backend deployed to Railway/Render/Heroku
- [ ] Database connected and migrated
- [ ] Environment variables configured
- [ ] API redirects updated in netlify.toml
- [ ] SSL certificates active
- [ ] Custom domain configured (optional)
- [ ] Admin user created
- [ ] Sample products seeded

### Custom Domain Setup

1. **In Netlify Dashboard:**
   - Go to Domain settings
   - Add custom domain: `willowbrook-clothing.com`
   - Configure DNS records

2. **DNS Configuration:**
   ```
   Type: CNAME
   Name: www
   Value: your-app.netlify.app
   
   Type: A
   Name: @
   Value: 75.2.60.5 (Netlify's IP)
   ```

### Performance Optimization

The deployment includes:
- ✅ Static asset caching (1 year)
- ✅ Gzip compression
- ✅ Security headers
- ✅ SPA routing support
- ✅ API proxy configuration

### Monitoring & Analytics

Consider adding:
- Google Analytics
- Sentry for error tracking
- Hotjar for user behavior
- Stripe Dashboard for payments

### Support

For deployment issues:
1. Check Netlify build logs
2. Verify environment variables
3. Test API endpoints
4. Check browser console for errors

Your Willowbrook Clothing platform is ready for production! 🎉
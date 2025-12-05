# Netlify Deployment Guide

This guide will help you deploy Willowbrook Clothing to Netlify with serverless functions.

## Architecture

- **Frontend**: React app served from Netlify CDN
- **Backend**: Express server converted to Netlify Functions
- **Database**: Your existing server database setup
- **API**: All server routes available at `/api/*`

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
3. **Database**: Whatever database your server routes use (if any)

## Quick Deployment

### 1. Prepare the Project

```bash
npm run prepare:netlify
```

This will:
- Install all dependencies
- Generate Prisma client
- Build the project
- Verify all required files

### 2. Database Setup (if needed)

If your server routes use a database, make sure it's configured:
- Set up your database connection
- Configure DATABASE_URL environment variable
- Run any necessary migrations

### 3. Deploy to Netlify

1. **Connect Repository**:
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - Build command: `npm run build:netlify`
   - Publish directory: `client/dist`
   - Functions directory: `netlify/functions`

3. **Set Environment Variables**:
   ```
   DATABASE_URL=your-database-connection-string (if needed)
   JWT_SECRET=your-super-secret-jwt-key-here
   CLIENT_URL=https://your-site.netlify.app
   NODE_VERSION=18
   ```

4. **Deploy**: Click "Deploy site"

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | ❓ (if using database) |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `CLIENT_URL` | Your Netlify site URL for CORS | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key (for payments) | ❌ |
| `NODE_VERSION` | Node.js version (set to 18) | ✅ |

## API Endpoints

All your Express routes are available under `/api/`:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/customizations` - Create customization
- `POST /api/orders` - Create order
- `GET /api/orders/user` - Get user orders
- `GET /api/admin/*` - Admin endpoints

## File Structure

```
├── netlify/
│   ├── functions/
│   │   ├── api.ts              # Main serverless function
│   │   ├── package.json        # Function dependencies
│   │   ├── tsconfig.json       # TypeScript config
│   │   ├── lib/
│   │   │   └── database.ts     # Lightweight database
│   │   ├── routes/             # API routes
│   │   └── middleware/         # Express middleware
├── netlify.toml                # Netlify configuration
├── client/                     # React frontend
├── server/                     # Original Express server
└── deploy-netlify.js          # Deployment helper
```

## Troubleshooting

### Build Errors

1. **Prisma Client Issues**:
   ```bash
   cd server && npx prisma generate
   cd netlify/functions && npm install
   ```

2. **TypeScript Errors**:
   - Check `netlify/functions/tsconfig.json`
   - Ensure all imports are correct

3. **Function Timeout**:
   - Netlify functions have a 10-second timeout
   - Optimize database queries
   - Use connection pooling

### Runtime Errors

1. **Database Connection**:
   - Verify `DATABASE_URL` is correct
   - Check Neon database is active
   - Ensure IP restrictions allow Netlify

2. **CORS Issues**:
   - Set `CLIENT_URL` to your Netlify domain
   - Check Netlify redirects in `netlify.toml`

3. **Authentication**:
   - Verify `JWT_SECRET` is set
   - Check token storage in frontend

## Performance Tips

1. **Database Optimization**:
   - Use Neon's connection pooling
   - Optimize Prisma queries
   - Add database indexes

2. **Function Optimization**:
   - Keep functions lightweight
   - Use external modules sparingly
   - Cache frequently accessed data

3. **Frontend Optimization**:
   - Enable Netlify's asset optimization
   - Use lazy loading for images
   - Implement proper caching headers

## Monitoring

- **Netlify Functions**: Check function logs in Netlify dashboard
- **Database**: Monitor Neon dashboard for query performance
- **Errors**: Set up error tracking (Sentry, LogRocket, etc.)

## Support

If you encounter issues:

1. Check Netlify function logs
2. Verify environment variables
3. Test database connection
4. Review build logs

For more help, consult:
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
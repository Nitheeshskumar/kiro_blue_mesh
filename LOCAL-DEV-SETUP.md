# Local Development Setup Guide

## Overview
The project now uses **Netlify Dev** for local development, which simulates the production serverless environment. This ensures your local development matches the deployed Netlify Functions exactly.

## What Changed

### 1. Development Command
**Old**: `npm run dev` → Ran legacy Express server on port 5000
**New**: `npm run dev` → Runs Netlify Dev on port 8888 + Client on port 3000

### 2. API Configuration
**Client `.env` updated**:
- Old: `VITE_API_URL=http://localhost:5000/api`
- New: `VITE_API_URL=http://localhost:8888/api`

### 3. Function Path Handling
Updated `netlify/functions/api.ts` to handle both:
- Production paths: `/.netlify/functions/api/*`
- Local dev paths: `/api/*`

## Running the Project

### Start Development Servers
```bash
npm run dev
```

This starts:
- **Client** (Vite): http://localhost:3000
- **Netlify Dev**: http://localhost:8888
- **Functions**: http://localhost:8888/.netlify/functions/api

### Individual Commands
```bash
# Start client only
npm run dev:client

# Start Netlify functions only
npm run dev:netlify

# Start legacy Express server (if needed)
npm run dev:server
```

## Testing the API

### Health Check
```bash
curl http://localhost:8888/.netlify/functions/api/health
```

### Login Test
```bash
curl -X POST http://localhost:8888/.netlify/functions/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Via Client
The React app at http://localhost:3000 will automatically use the Netlify Dev API.

## Environment Variables

### Required in Root `.env`
```env
SUPABASE_URL=https://frbdhevxgofuvnrcbcvi.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DATABASE_URL=postgresql://...
JWT_SECRET=willowbrook-clothing-jwt-secret-key-12345
```

### Required in `client/.env`
```env
VITE_API_URL=http://localhost:8888/api
VITE_SUPABASE_URL=https://frbdhevxgofuvnrcbcvi.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=Willowbrook Clothing
```

## Advantages of Netlify Dev

1. **Production Parity**: Exact same code runs locally and in production
2. **Function Testing**: Test serverless functions before deployment
3. **Redirects**: Tests netlify.toml redirects locally
4. **Environment**: Loads environment variables from netlify.toml
5. **Hot Reload**: Functions reload automatically on code changes

## Troubleshooting

### Port Already in Use
If port 8888 is busy:
```bash
# Kill the process using port 8888
npx kill-port 8888

# Or change the port in netlify.toml
```

### Functions Not Loading
```bash
# Rebuild functions
npm run build:functions

# Check function logs in terminal
```

### CORS Issues
Netlify Dev handles CORS automatically. If you see CORS errors:
1. Check that client is using `http://localhost:8888/api`
2. Verify `netlify.toml` has correct redirects
3. Restart both servers

### Database Connection Issues
```bash
# Test Supabase connection
npm run test-supabase-connection

# Verify environment variables are loaded
```

## Deployment

When you deploy to Netlify, the same code runs but with production URLs:
- Client: `https://your-site.netlify.app`
- Functions: `https://your-site.netlify.app/.netlify/functions/api`
- Redirects: `/api/*` → `/.netlify/functions/api/*`

No code changes needed between local and production!

## Legacy Express Server

The old Express server in `server/` is still available for reference:
```bash
npm run dev:server
```

But it's recommended to use Netlify Dev for consistency with production.

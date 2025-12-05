# 🚀 Start Here - Quick Setup Guide

## Current Status

✅ Database connected to Supabase
✅ Admin user created
✅ API routing fixed
✅ Environment variables configured

## Start Development

### Option 1: Full Stack with Netlify Dev (Recommended)

```bash
npm run dev
```

This starts:
- React client (Vite)
- Netlify Functions (serverless API)
- Everything on `http://localhost:8888`

### Option 2: Just Test the API

```bash
# Test routing
npm run test-routing

# Test login
npm run test-login
```

## Login Credentials

- **Email**: `admin@willowbrook.com`
- **Password**: `secret123`

## If Login Doesn't Work

### Quick Fix (Run this first!)

```bash
npm run fix-login
```

This will:
1. Rebuild functions
2. Reset password
3. Test everything

### Manual Steps

1. **Rebuild functions**:
   ```bash
   npm run build:functions
   ```

2. **Reset password**:
   ```bash
   npm run reset-password
   ```

3. **Test login**:
   ```bash
   npm run test-login
   ```

4. **Start dev server**:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Error: "Route not found"

This means the API routing isn't working. Try:

```bash
# Rebuild functions
npm run build:functions

# Test routing
npm run test-routing

# Restart dev server
npm run dev
```

### Error: "500 Internal Server Error"

Check the terminal running `npm run dev` for error logs. Common issues:

1. **Database connection**: Check `.env` has `SUPABASE_DATABASE_URL`
2. **Missing dependencies**: Run `npm install`
3. **Functions not built**: Run `npm run build:functions`

### Error: "Cannot connect to database"

```bash
# Test database connection
npm run test-supabase-connection

# Check environment variables
cat .env | grep SUPABASE
```

## Project Structure

```
willowbrook-clothing/
├── client/              # React frontend (Vite)
│   ├── src/
│   └── .env            # VITE_API_URL=http://localhost:8888/api
├── netlify/
│   └── functions/      # Serverless API (production code)
│       ├── api.ts      # Main API handler
│       └── routes/     # API routes
├── server/             # Legacy Express server (not used)
├── .env                # Supabase credentials
└── netlify.toml        # Netlify configuration
```

## Important Files

- `client/.env` - Frontend environment (API URL)
- `.env` - Backend environment (Supabase, JWT)
- `netlify.toml` - Deployment & routing config
- `netlify/functions/api.ts` - API entry point

## Useful Commands

```bash
# Development
npm run dev                    # Start full stack
npm run dev:client             # Client only
npm run dev:netlify            # Functions only

# Testing
npm run test-login             # Test login
npm run test-routing           # Test API routing
npm run test-supabase-connection  # Test database

# Maintenance
npm run fix-login              # Quick fix for login issues
npm run reset-password         # Reset admin password
npm run build:functions        # Rebuild functions

# Database
npm run setup-supabase-db      # Setup database
npm run seed-supabase-db       # Seed sample data
```

## Next Steps

1. Run `npm run dev`
2. Open `http://localhost:8888`
3. Login with admin credentials
4. Start building!

## Need Help?

Check these guides:
- `LOGIN-FIX-SUMMARY.md` - What was fixed
- `LOCAL-DEVELOPMENT.md` - Development guide
- `DEBUG-LOGIN-ISSUE.md` - Debugging steps

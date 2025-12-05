# Local Development Guide

## The Problem You Had

You were getting a 500 error when trying to login locally because:

1. **Wrong Server**: Running `npm run dev` was starting the legacy Express server in `server/` which uses Prisma
2. **Different Database Layer**: The Netlify functions use a custom database layer with Supabase, not Prisma
3. **Password Mismatch**: The admin password hash in the database was outdated

## Solution

### Option 1: Use Netlify Dev (Recommended)

This runs your Netlify functions locally, exactly as they run in production:

```bash
# Start both client and Netlify functions
npm run dev
```

This will:
- Start the React client on `http://localhost:3000`
- Start Netlify functions on `http://localhost:8888`
- The client will proxy API calls to the functions

### Option 2: Use Legacy Server (Not Recommended)

If you want to use the old Prisma-based server:

```bash
# Start client and legacy server separately
npm run dev:client  # Client on port 3000
npm run dev:server  # Server on port 5000
```

**Note**: This uses a different database schema and may not work with the current frontend.

## Login Credentials

After running the setup, you can login with:

- **Email**: `admin@willowbrook.com`
- **Password**: `secret123`

## Troubleshooting

### Reset Admin Password

If you can't login, reset the admin password:

```bash
node reset-admin-password.js
```

### Test Database Connection

```bash
node test-login-local.js
```

### Rebuild Functions

If you make changes to the Netlify functions:

```bash
npm run build:functions
```

## Environment Variables

Make sure your `.env` file has:

```env
SUPABASE_DATABASE_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
JWT_SECRET="willowbrook-clothing-jwt-secret-key-12345"
```

## API Endpoints

When running locally with Netlify Dev:

- Client: `http://localhost:8888` (Netlify Dev serves both)
- API: `http://localhost:8888/api/*`
- Functions: `http://localhost:8888/.netlify/functions/*`

The client's `VITE_API_URL` should be set to `/api` (relative) or `http://localhost:8888/api` (absolute).

# 🚀 Quick Start Guide

## Automated Setup (Easiest)

### 1. Run Complete Setup
```bash
npm run auto-setup
```

### 2. Configure Supabase
Edit `.env` with your Supabase credentials:
```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
JWT_SECRET="your-secret-key-here"
```

### 3. Setup Supabase Database
```bash
npm run setup-supabase-db
npm run seed-supabase-db
```

### 4. Start the Project
```bash
npm start
```

## Manual Setup (If automated fails)

### 1. Install Dependencies
```bash
npm install
cd client && npm install react-router-dom lucide-react axios zustand
npm install --save-dev @types/react-router-dom
cd ../server && npm install
cd ..
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Setup Supabase Database
```bash
npm run setup-supabase-db
npm run seed-supabase-db
```

### 4. Start Development
```bash
npm run dev
```

## Access the App

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## Features to Try

1. Browse products at `/products`
2. Customize a t-shirt with colors and embroidery
3. Add items to cart
4. Register/login
5. Place orders and track them

## Troubleshooting

```bash
# Check what's installed
npm run check-deps

# Fix missing dependencies
npm run install-deps

# Fix TypeScript issues
npm run fix-typescript

# Test Supabase connection
npm run test-supabase-connection
```

That's it! Your clothing customizer is ready! 🎉
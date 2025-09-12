# 🚀 Quick Start Guide

## Automated Setup (Easiest)

### 1. Run Complete Setup
```bash
npm run auto-setup
```

### 2. Configure Database
Edit `server/.env` with your PostgreSQL database URL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/clothing_customizer"
JWT_SECRET="your-secret-key-here"
```

### 3. Setup Database
```bash
cd server
npm run db:push
npm run db:seed
cd ..
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
cp server/.env.example server/.env
# Edit server/.env with your database details
```

### 3. Setup Database
```bash
cd server
npm run db:push
npm run db:seed
cd ..
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
```

That's it! Your clothing customizer is ready! 🎉
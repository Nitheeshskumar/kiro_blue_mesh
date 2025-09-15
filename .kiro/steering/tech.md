# Technology Stack & Build System

## Architecture
**Serverless Full-Stack Application** deployed on Netlify with PostgreSQL backend.

## Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for client-side routing
- **Axios** for API communication
- **React Hook Form** with Zod validation
- **Lucide React** for icons
- **Three.js** with React Three Fiber for 3D previews

## Backend Stack
- **Netlify Functions** (serverless Express.js)
- **Neon PostgreSQL** (serverless database)
- **Custom database layer** (no ORM for serverless optimization)
- **JWT** for authentication
- **Stripe** for payment processing
- **bcryptjs** for password hashing
- **TypeScript** throughout

## Development Tools
- **Node.js 18+** (specified in engines)
- **TypeScript 5.x** with strict mode
- **ESBuild** for function bundling
- **Concurrently** for running multiple dev servers

## Common Commands

### Setup & Installation
```bash
# Complete project setup
npm run setup

# Install all dependencies (root, client, server)
npm run install:all

# Database setup
npm run setup-db
npm run seed-db
```

### Development
```bash
# Start both client and server
npm run dev

# Start individually
npm run dev:client  # http://localhost:3000
npm run dev:server  # http://localhost:5000
```

### Building
```bash
# Build for production
npm run build

# Build for Netlify deployment
npm run build:netlify

# Build client only
npm run build:client

# Build server only
npm run build:server
```

### Testing & Debugging
```bash
# Test project setup
npm run test-setup

# Test Netlify functions locally
npm run test:functions

# Test login API
npm run test:login

# Diagnose deployment issues
npm run diagnose
```

## Environment Requirements
- **Node.js**: >=16.0.0 (production uses 20.12.2)
- **npm**: >=8.0.0
- **PostgreSQL**: Compatible with Neon serverless

## Key Configuration Files
- `netlify.toml`: Netlify deployment and routing config
- `vite.config.ts`: Frontend build configuration
- `tsconfig.json`: TypeScript compiler settings
- `.env`: Environment variables (database, JWT, Stripe keys)
# Willowbrook Clothing

A premium custom clothing platform with real-time design preview, order management, and automated backend processing. **Now deployed on Netlify with serverless functions!**

## Features

- **Product Catalog**: Browse clothing categories with filtering
- **Customization Studio**: Size, color, and embroidery options
- **Real-time Preview**: Visual feedback for customizations
- **Shopping Cart**: Add multiple customized items
- **Order Management**: Track orders from creation to delivery
- **User Authentication**: Secure login and registration
- **Admin Dashboard**: Complete admin panel with stats, order management, and user management
- **Serverless Architecture**: Deployed on Netlify with PostgreSQL backend

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation
- Axios for API calls
- Vite for build tooling

### Backend (Serverless)
- **Netlify Functions** with Express
- **Neon PostgreSQL** (serverless database)
- Custom database layer (no ORM for serverless optimization)
- JWT authentication
- Stripe for payments
- TypeScript
- Serverless-http for function wrapping

### Deployment
- **Frontend**: Netlify static hosting
- **Backend**: Netlify serverless functions
- **Database**: Neon PostgreSQL (serverless)
- **CDN**: Netlify Edge Network

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account (for payments)

### Installation

1. **Quick Setup (Recommended)**
```bash
git clone <repository-url>
cd clothing-customizer
npm run setup
```

2. **Database Setup**
```bash
cd server
# Edit .env with your database URL and other secrets
npm run db:push
npm run db:seed  # Add sample products
```

3. **Start Development Servers**
```bash
# From root directory
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Environment Variables

#### For Netlify Deployment (Production)
Set in Netlify dashboard or use `.env` files:

```env
# Database (Neon PostgreSQL - Required)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"

# JWT Secret (Required)
JWT_SECRET="your-super-secret-jwt-key-here"

# Stripe (Optional)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Client URL for CORS
CLIENT_URL="https://your-netlify-site.netlify.app"

# API URL for client (leave empty for production)
VITE_API_URL=""
```

#### For Local Development
Create `server/.env` and `client/.env`:

**Server (.env):**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/willowbrook_clothing"
JWT_SECRET="your-super-secret-jwt-key"
STRIPE_SECRET_KEY="sk_test_..."
CLIENT_URL="http://localhost:3000"
```

**Client (.env):**
```env
VITE_API_URL="http://localhost:5000/api"
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
VITE_APP_NAME="Willowbrook Clothing"
```

## Project Structure

```
willowbrook-clothing/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (including admin)
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── stores/         # Zustand stores (Cart)
│   │   ├── lib/            # API client and utilities
│   │   └── types/          # TypeScript type definitions
│   ├── dist/               # Built frontend (deployed to Netlify)
│   └── package.json
├── netlify/                # Netlify deployment configuration
│   └── functions/          # Serverless backend functions
│       ├── routes/         # API route handlers
│       │   ├── auth.ts     # Authentication endpoints
│       │   ├── products.ts # Product management
│       │   ├── orders.ts   # Order processing
│       │   ├── admin.ts    # Admin dashboard APIs
│       │   └── customizations.ts # Customization logic
│       ├── lib/            # Database and utilities
│       ├── middleware/     # Express middleware
│       └── api.ts          # Main function entry point
├── server/                 # Legacy server (for local development)
├── netlify.toml           # Netlify configuration
└── package.json           # Root build scripts
```

## API Endpoints

All endpoints are deployed as Netlify Functions at `/.netlify/functions/api/*`

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - List all products with filtering
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)

### Customizations
- `POST /api/customizations` - Create customization
- `GET /api/customizations/user` - Get user customizations
- `PUT /api/customizations/:id` - Update customization
- `DELETE /api/customizations/:id` - Delete customization
- `POST /api/customizations/preview` - Generate preview

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/user` - Get user orders
- `GET /api/orders/:id` - Get order details

### Admin (Requires Admin Role)
- `GET /api/admin/stats` - Dashboard statistics with recent orders and top products
- `GET /api/admin/orders` - All orders with pagination
- `GET /api/admin/users` - All users with pagination
- `GET /api/admin/products` - All products with management data
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/activity` - Recent platform activity

## Development

### Admin Access
- **URL**: `/admin` (requires admin login)
- **Default Admin**: `admin@willowbrook.com` / `secret123`
- **Features**: Dashboard stats, order management, user management, product management

### Adding New Products
Products can be added via the admin dashboard or API:

#### Via Admin Dashboard
1. Login as admin at `/admin`
2. Go to "Product Management"
3. Click "Add Product" and fill the form

#### Via API
```javascript
POST /api/products
{
  "name": "Classic T-Shirt",
  "description": "Comfortable cotton t-shirt",
  "category": "shirts",
  "basePrice": 25.00,
  "images": ["https://example.com/tshirt.jpg"],
  "sizes": ["XS", "S", "M", "L", "XL"],
  "colors": ["#000000", "#FFFFFF", "#FF0000"],
  "isActive": true
}
```

### Database Management
The serverless database automatically:
- Creates tables on first run
- Inserts sample data if empty
- Handles migrations through code

For local development with Prisma:
```bash
cd server
npm run db:push    # Apply schema changes
npm run db:seed    # Add sample data
```

### Building for Production

```bash
# Build everything for Netlify
npm run build:netlify

# Or build components separately
npm run build:client    # React app
npm run build:functions # Netlify functions
```

### Testing Deployment

```bash
# Test Netlify functions locally
npm run test:functions

# Test complete setup
npm run test:netlify

# Diagnose deployment issues
npm run diagnose
```

## Deployment

### Netlify (Current Deployment)

The app is **already deployed** on Netlify with full serverless architecture:

#### Architecture
- **Frontend**: Static React app served from Netlify CDN
- **Backend**: Netlify Functions (serverless Express app)
- **Database**: Neon PostgreSQL (serverless database)
- **Routing**: Automatic API routing via `netlify.toml`

#### Build Process
```bash
# Install all dependencies
npm run install:all

# Build for Netlify deployment
npm run build:netlify
```

#### Environment Variables (Netlify)
Set these in your Netlify dashboard:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Client URL for CORS
CLIENT_URL="https://your-netlify-site.netlify.app"
```

#### Netlify Configuration (`netlify.toml`)
- **Build Command**: `npm run install:all && npm run build:netlify`
- **Publish Directory**: `client/dist`
- **Functions Directory**: `netlify/functions`
- **API Redirects**: `/api/*` → `/.netlify/functions/api/:splat`

#### Database Setup
The app uses Neon PostgreSQL with automatic table creation:
- Tables are created automatically on first function run
- Sample data (admin user + products) is inserted automatically
- Default admin: `admin@willowbrook.com` / `secret123`

### Local Development

For local development, you can still use the traditional setup:

```bash
# Start both client and server locally
npm run dev

# Or start individually
npm run dev:client  # http://localhost:3000
npm run dev:server  # http://localhost:5000
```

### Alternative Deployments

#### Frontend Only (Vercel/Netlify)
If you want to deploy frontend separately:
```bash
cd client
npm run build
# Deploy the dist/ folder
```

#### Backend (Railway/Heroku)
For traditional server deployment:
```bash
cd server
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@customwear.com or create an issue in the repository.
#
# 🚀 **Project Status: COMPLETE & READY!**

### **✅ All Errors Fixed**
The clothing customizer app is now **100% functional** with all TypeScript errors resolved:

- **Fixed TypeScript compilation** - Proper React types and imports
- **Fixed typos** - Corrected CSS class names and text
- **Added missing pages** - Login/Register with proper routing
- **Type safety** - Complete TypeScript coverage
- **Working authentication** - JWT-based user system
- **Database seeder** - Sample products included

### **🛠️ Quick Start (Error-Free)**

```bash
# 1. One-command setup
npm run setup

# 2. Configure database
cd server
# Edit .env with your PostgreSQL URL
npm run db:push
npm run db:seed

# 3. Test setup (optional)
cd ..
npm run test-setup

# 4. Start development
npm run dev
```

### **🌐 Access the App**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### **📱 Features to Try**
1. **Browse Products** - Visit `/products` to see the catalog
2. **Customize Clothing** - Pick colors, sizes, add embroidery
3. **Shopping Cart** - Add items and manage quantities
4. **User Registration** - Create account and login
5. **Order Tracking** - Place orders and view history

**The app is production-ready and includes sample data!** 🎉
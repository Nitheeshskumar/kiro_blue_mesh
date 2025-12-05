# Project Structure & Organization

## Root Directory Layout
```
willowbrook-clothing/
├── client/                 # React frontend (Vite)
├── server/                 # Legacy Express server (local dev)
├── netlify/                # Netlify serverless functions
├── .kiro/                  # Kiro IDE configuration
├── .vscode/                # VS Code settings
├── package.json            # Root build scripts & dependencies
├── netlify.toml           # Netlify deployment config
├── supabase-schema.sql     # Supabase database schema
├── supabase-sample-data.sql # Sample data for Supabase
├── setup-supabase-database.js # Supabase setup script
├── test-supabase-connection.js # Connection testing
└── *.js                   # Setup & utility scripts
```

## Frontend Structure (`client/`)
```
client/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components (Home, Products, Admin)
│   ├── contexts/          # React contexts (AuthContext)
│   ├── stores/            # Zustand stores (CartStore)
│   ├── lib/               # API client & utilities
│   ├── types/             # TypeScript type definitions
│   └── App.tsx            # Main app component
├── dist/                  # Built frontend (Netlify publish dir)
├── public/                # Static assets
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
└── package.json           # Frontend dependencies
```

## Backend Structure (`netlify/functions/`)
```
netlify/functions/
├── routes/                # API route handlers
│   ├── auth.ts           # Authentication endpoints
│   ├── products.ts       # Product management
│   ├── orders.ts         # Order processing
│   ├── admin.ts          # Admin dashboard APIs
│   └── customizations.ts # Customization logic
├── lib/                  # Database & utilities
│   ├── database.ts       # Custom database layer
│   └── utils.ts          # Helper functions
├── middleware/           # Express middleware
└── api.ts               # Main function entry point
```

## Legacy Server (`server/`)
Used for local development only. Contains Prisma schema and traditional Express setup.

## Key Conventions

### File Naming
- **Components**: PascalCase (`ProductCard.tsx`)
- **Pages**: PascalCase (`ProductsPage.tsx`)
- **Utilities**: camelCase (`apiClient.ts`)
- **Types**: PascalCase with `.types.ts` suffix
- **API Routes**: kebab-case endpoints (`/api/auth/login`)

### Import Organization
1. External libraries (React, etc.)
2. Internal components/utilities
3. Type imports (with `type` keyword)
4. Relative imports

### TypeScript Patterns
- Strict mode enabled across all projects
- Interface definitions in dedicated `.types.ts` files
- Proper Express request/response typing in API routes
- Zod schemas for validation

### API Structure
- RESTful endpoints under `/api/*`
- JWT authentication middleware
- Role-based access control (CUSTOMER/ADMIN)
- Consistent error response format
- Request/response validation with Zod

### Database Layer
- Custom database abstraction (no ORM for serverless optimization)
- **Supabase PostgreSQL** with enhanced capabilities:
  - Direct PostgreSQL connection via `pg` pool for existing operations
  - Optional Supabase client for real-time features and enhanced auth
  - Connection pooling optimized for serverless functions
  - SSL connections in production environment
- **Schema Management**:
  - SQL schema files: `supabase-schema.sql`, `supabase-sample-data.sql`
  - Automatic table creation and seeding via setup scripts
  - Database validation and health monitoring
- **Supabase-Specific Patterns**:
  - Environment-based connection configuration
  - Optional real-time subscriptions for live updates
  - Enhanced authentication integration capabilities
  - Row-level security (RLS) ready for future implementation

### Deployment Structure
- **Frontend**: Static files served from Netlify CDN
- **Backend**: Serverless functions at `/.netlify/functions/api/*`
- **Database**: Supabase PostgreSQL with multiple access methods:
  - Direct PostgreSQL connection via `SUPABASE_DATABASE_URL`
  - Supabase API access via `SUPABASE_URL` and API keys
  - Real-time capabilities and enhanced features available
- **Environment Configuration**:
  - Supabase project credentials in environment variables
  - SSL-enabled connections for production security
  - Connection pooling for optimal serverless performance
- **Routing**: API calls proxied via `netlify.toml` redirects
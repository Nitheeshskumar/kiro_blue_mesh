# Admin Security Implementation

This document outlines the comprehensive security measures implemented for admin endpoints in the Willowbrook Clothing platform.

## Security Architecture

### 1. Centralized Authentication Middleware

All admin endpoints are protected by a centralized authentication system located in `netlify/functions/middleware/auth.ts`:

- **`authenticateToken`**: Validates JWT tokens and loads user information
- **`requireAdmin`**: Ensures the authenticated user has admin role
- **`requireActiveUser`**: Additional security checks for user status

### 2. Admin Endpoint Protection

All admin endpoints are protected using one of these patterns:

#### Pattern 1: Global Middleware (Recommended)
```typescript
// Apply to all routes in the router
router.use(authenticateToken, requireAdmin)
```

#### Pattern 2: Per-Route Middleware
```typescript
// Apply to specific routes
router.get('/endpoint', authenticateToken, requireAdmin, handler)
```

### 3. Protected Admin Endpoints

#### Admin Dashboard & Stats
- `GET /admin/stats` - Dashboard statistics
- `GET /admin/activity` - Recent activity feed

#### User Management
- `GET /admin/users` - List all users
- `POST /admin/users` - Create new admin/customer users
- `PUT /admin/users/:id/role` - Update user roles
- `DELETE /admin/users/:id` - Delete users (with safety checks)

#### Product Management
- `GET /admin/products` - List all products (admin view)
- `POST /admin/products` - Create new products
- `PUT /admin/products/:id` - Update products
- `DELETE /admin/products/:id` - Deactivate products

#### Order Management
- `GET /admin/orders` - List all orders
- `PUT /orders/:id/status` - Update order status

#### Category Management
- `GET /admin/categories` - List categories (admin view)
- `POST /admin/categories` - Create categories
- `PUT /admin/categories/:id` - Update categories
- `DELETE /admin/categories/:id` - Delete categories

#### Product Routes (Admin Functions)
- `POST /products` - Create products
- `PUT /products/:id` - Update products
- `DELETE /products/:id` - Delete products

## Security Features

### 1. JWT Token Validation
- Validates token format and signature
- Checks token expiration
- Verifies user exists in database
- Removes sensitive data (password) from user object

### 2. Role-Based Access Control
- Strict admin role verification
- Prevents privilege escalation
- Logs access attempts for audit trail

### 3. Input Validation
- Email format validation
- Password strength requirements
- Role validation (only ADMIN/CUSTOMER allowed)
- Data sanitization and trimming

### 4. Safety Checks
- Prevents admin users from deleting themselves
- Prevents deletion of users with existing orders
- Prevents deletion of categories with products
- Validates data relationships before operations

### 5. Error Handling
- Consistent error responses
- No sensitive information leakage
- Proper HTTP status codes
- Detailed logging for debugging

### 6. Audit Logging
- Authentication attempts
- Admin access grants/denials
- User role changes
- Critical operations

## Testing & Validation

### Automated Security Tests

Run the comprehensive security test suite:

```bash
npm run test-admin-security
```

This test validates:
- ✅ Unauthenticated requests are rejected (401)
- ✅ Customer requests to admin endpoints are rejected (403)
- ✅ Admin requests are properly authenticated
- ✅ Invalid tokens are rejected
- ✅ Malformed tokens are rejected

### Manual Testing

1. **Create Admin User**:
   ```bash
   npm run ensure-admin
   ```

2. **Test User Management**:
   ```bash
   npm run test-user-management
   ```

3. **Test All Admin Endpoints**:
   ```bash
   npm run test-admin-security
   ```

## Security Best Practices Implemented

### 1. Defense in Depth
- Multiple layers of security checks
- Centralized authentication logic
- Consistent error handling

### 2. Principle of Least Privilege
- Role-based access control
- Granular permissions
- No unnecessary access grants

### 3. Secure by Default
- All admin routes protected by default
- Explicit authentication required
- No fallback to insecure modes

### 4. Input Validation
- Server-side validation for all inputs
- Sanitization of user data
- Type checking and format validation

### 5. Error Handling
- No information disclosure in errors
- Consistent error responses
- Proper logging without sensitive data

## Environment Security

### Required Environment Variables
- `JWT_SECRET`: Strong secret for token signing
- `SUPABASE_DATABASE_URL`: Secure database connection
- `SUPABASE_SERVICE_ROLE_KEY`: Admin database access

### Security Headers
The middleware adds security logging and validation but relies on the platform (Netlify) for additional security headers.

## Monitoring & Alerts

### Logging
All authentication and authorization events are logged with:
- User identification
- Endpoint accessed
- Success/failure status
- Timestamp
- IP address (via request headers)

### Recommended Monitoring
- Failed authentication attempts
- Admin access patterns
- Unusual activity patterns
- Token validation failures

## Compliance & Standards

This implementation follows:
- OWASP security guidelines
- JWT best practices
- Node.js security recommendations
- Express.js security patterns

## Maintenance

### Regular Security Tasks
1. **Token Secret Rotation**: Periodically update JWT_SECRET
2. **Access Review**: Regular audit of admin users
3. **Log Analysis**: Monitor authentication logs
4. **Dependency Updates**: Keep security packages updated

### Security Updates
When updating security-related code:
1. Run full security test suite
2. Review all admin endpoints
3. Test with different user roles
4. Verify logging functionality
5. Update documentation

## Emergency Procedures

### Suspected Security Breach
1. Immediately rotate JWT_SECRET
2. Force logout all users (tokens become invalid)
3. Review access logs
4. Audit admin user accounts
5. Check for unauthorized changes

### Admin Account Compromise
1. Disable compromised admin account
2. Create new admin account
3. Review all recent admin actions
4. Check for unauthorized changes
5. Update all admin passwords

## Contact & Support

For security-related issues or questions:
- Review this documentation
- Run automated security tests
- Check implementation in middleware files
- Verify endpoint protection patterns

Remember: Security is an ongoing process, not a one-time implementation. Regular testing and monitoring are essential.
# Category Management System

This document describes the new category management functionality added to the Willowbrook Clothing admin panel.

## Overview

The category management system allows administrators to:
- ✅ **Create** new product categories
- ✅ **Edit** existing categories (name, description, icon)
- ✅ **Delete** categories (with safety checks)
- ✅ **View** all categories with product counts
- ✅ **Search** and filter categories

## Features

### 1. Category CRUD Operations
- **Create**: Add new categories with name, description, and emoji icon
- **Read**: View all categories with product counts and creation dates
- **Update**: Modify category details while maintaining data integrity
- **Delete**: Remove categories with validation (prevents deletion if products exist)

### 2. Data Validation
- Category names: 2-50 characters
- Descriptions: 10-200 characters
- Unique name/slug validation
- Icon selection from predefined emoji set

### 3. Safety Features
- Cannot delete categories that contain products
- Automatic slug generation from category names
- Duplicate name prevention
- Product count tracking

### 4. User Interface
- Responsive design for desktop and mobile
- Search functionality
- Modal-based forms for create/edit operations
- Confirmation dialogs for destructive actions
- Loading states and error handling

## Database Schema

### product_categories Table
```sql
CREATE TABLE product_categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  "productCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
- `idx_product_categories_slug` on slug
- `idx_product_categories_name` on name

## API Endpoints

### Public Endpoints
- `GET /categories` - Get all categories with product counts

### Admin Endpoints (Require Authentication)
- `GET /admin/categories` - Get all categories for admin
- `POST /admin/categories` - Create new category
- `PUT /admin/categories/:id` - Update category
- `DELETE /admin/categories/:id` - Delete category

### Request/Response Examples

#### Create Category
```json
POST /admin/categories
{
  "name": "Summer Collection",
  "description": "Light and breezy clothing for summer",
  "icon": "☀️"
}
```

#### Response
```json
{
  "id": "cat_1703123456789_abc123def",
  "name": "Summer Collection",
  "slug": "summer-collection",
  "description": "Light and breezy clothing for summer",
  "icon": "☀️",
  "productCount": 0,
  "createdAt": "2024-12-28T10:30:00.000Z",
  "updatedAt": "2024-12-28T10:30:00.000Z"
}
```

## Frontend Components

### CategoryManagement.tsx
Main component located at `client/src/pages/admin/CategoryManagement.tsx`

**Features:**
- Category listing with search
- Create/Edit modals
- Delete confirmation
- Responsive table design
- Loading and error states

### Navigation Integration
- Added to `AdminLayout.tsx` navigation menu
- Route configured in `App.tsx`
- Icon: Tag (from Lucide React)

## Usage Instructions

### For Administrators

#### Accessing Category Management
1. Log in as an admin user
2. Navigate to Admin Panel
3. Click "Categories" in the sidebar menu

#### Creating a New Category
1. Click "Add Category" button
2. Fill in the form:
   - **Name**: Enter category name (2-50 characters)
   - **Description**: Provide detailed description (10-200 characters)
   - **Icon**: Select an emoji icon from the grid
3. Click "Create Category"

#### Editing a Category
1. Find the category in the list
2. Click the edit icon (pencil) in the Actions column
3. Modify the fields as needed
4. Click "Update Category"

#### Deleting a Category
1. Find the category in the list
2. Click the delete icon (trash) in the Actions column
3. Confirm the deletion in the modal
4. **Note**: Categories with products cannot be deleted

#### Searching Categories
- Use the search box to filter by name or description
- Search is case-insensitive and matches partial text

## Technical Implementation

### Backend Architecture
- **Database Layer**: Custom database abstraction with PostgreSQL
- **API Layer**: Express.js routes with authentication middleware
- **Validation**: Server-side validation with detailed error messages
- **Security**: Admin-only access with JWT authentication

### Frontend Architecture
- **React Components**: Functional components with hooks
- **State Management**: Local state with useState
- **API Communication**: Axios for HTTP requests
- **UI Framework**: Tailwind CSS for styling
- **Icons**: Lucide React icon library

### Error Handling
- **Frontend**: User-friendly error messages and loading states
- **Backend**: Comprehensive error responses with appropriate HTTP status codes
- **Database**: Transaction safety and constraint validation

## Setup and Configuration

### Database Setup
1. Run the schema migration:
   ```bash
   node setup-sample-categories.js
   ```

2. This will create:
   - Sample categories if they don't exist
   - Update product counts for existing categories

### Environment Variables
Ensure these are set in your `.env` file:
```env
SUPABASE_DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
```

### Testing
Run the test script to verify functionality:
```bash
node test-category-management.js
```

## Sample Categories

The system comes with these default categories:
- 👕 T-Shirts & Tops
- 🧥 Hoodies & Sweatshirts  
- 👗 Dresses
- 👒 Accessories
- 👶 Baby & Kids
- 🤱 Maternity

## Available Icons

The system provides these emoji icons for categories:
👕 👔 👗 👖 🧥 👒 👟 👠 👜 🎒 🧢 🧣 🧤 👶 🤱 🎉

## Security Considerations

### Authentication
- All admin endpoints require valid JWT token
- User role must be 'ADMIN'
- Token validation on every request

### Data Validation
- Input sanitization on all fields
- SQL injection prevention through parameterized queries
- XSS prevention through proper encoding

### Authorization
- Role-based access control
- Admin-only operations
- Audit trail through timestamps

## Performance Considerations

### Database Optimization
- Indexed columns for fast lookups
- Efficient product count queries
- Connection pooling for serverless functions

### Frontend Optimization
- Lazy loading of category data
- Debounced search functionality
- Optimistic UI updates

## Troubleshooting

### Common Issues

#### "Category not found" Error
- Verify the category ID exists in the database
- Check if the category was recently deleted

#### "Cannot delete category" Error
- Category contains products
- Move products to other categories first
- Or delete products before deleting category

#### Authentication Errors
- Verify JWT token is valid
- Check user has ADMIN role
- Ensure proper Authorization header format

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify API endpoints are responding
3. Check database connection
4. Validate environment variables

## Future Enhancements

### Planned Features
- [ ] Category hierarchy (parent/child relationships)
- [ ] Bulk category operations
- [ ] Category image uploads
- [ ] Category-specific SEO settings
- [ ] Category analytics and insights

### API Improvements
- [ ] Pagination for large category lists
- [ ] Advanced filtering options
- [ ] Category export/import functionality
- [ ] Audit logging for category changes

## Support

For technical support or questions about the category management system:
1. Check this documentation first
2. Review the test scripts for usage examples
3. Examine the source code for implementation details
4. Contact the development team for additional assistance

---

**Last Updated**: December 28, 2024
**Version**: 1.0.0
**Author**: Kiro AI Assistant
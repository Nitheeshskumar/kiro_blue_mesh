import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const location = useLocation();
  
  // Generate breadcrumb items from current path if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];
    
    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable label
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Handle specific routes
      switch (segment) {
        case 'brand-story':
          label = 'Our Story';
          break;
        case 'customize':
          label = 'Customize';
          break;
        case 'order-success':
          label = 'Order Success';
          break;
        default:
          // Replace hyphens with spaces and capitalize
          label = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      breadcrumbs.push({ label, path: currentPath });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbItems = items || generateBreadcrumbs();
  
  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }
  
  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            )}
            {index === 0 ? (
              <Link
                to={item.path}
                className="flex items-center hover:text-primary-600 transition-colors duration-200"
              >
                <Home className="w-4 h-4 mr-1" />
                <span className="sr-only">{item.label}</span>
              </Link>
            ) : index === breadcrumbItems.length - 1 ? (
              <span className="text-gray-900 font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-primary-600 transition-colors duration-200"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
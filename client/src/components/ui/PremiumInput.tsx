import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { PremiumInputProps } from '../../types/ui.types';

const PremiumInput: React.FC<PremiumInputProps> = ({
  variant = 'default',
  size = 'md',
  label,
  error,
  success,
  helperText,
  icon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  // Base input classes
  const baseClasses = 'input-base transition-all duration-base';
  
  // Variant classes
  const variantClasses = {
    default: 'border-neutral-300 focus:ring-primary-500 focus:border-transparent',
    error: 'border-error-500 focus:ring-error-500 focus:border-transparent bg-error-50',
    success: 'border-success-500 focus:ring-success-500 focus:border-transparent bg-success-50'
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-3 py-2 text-sm rounded-lg',
    lg: 'px-4 py-3 text-base rounded-lg'
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Icon padding adjustment
  const iconPaddingClasses = icon ? 'pl-10' : '';
  
  // Combine input classes
  const inputClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    iconPaddingClasses,
    className
  ].filter(Boolean).join(' ');
  
  // Status icon
  const StatusIcon = error ? AlertCircle : success ? CheckCircle : null;
  const statusIconColor = error ? 'text-error-500' : success ? 'text-success-500' : '';
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Leading Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-neutral-400">{icon}</span>
          </div>
        )}
        
        {/* Input Field */}
        <input
          className={inputClasses}
          {...props}
        />
        
        {/* Status Icon */}
        {StatusIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <StatusIcon className={`w-4 h-4 ${statusIconColor}`} />
          </div>
        )}
      </div>
      
      {/* Helper Text / Error / Success Message */}
      {(error || success || helperText) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-error-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-success-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {success}
            </p>
          )}
          {helperText && !error && !success && (
            <p className="text-sm text-neutral-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PremiumInput;
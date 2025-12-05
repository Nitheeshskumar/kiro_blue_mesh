import React from 'react';
import { Loader2 } from 'lucide-react';
import { PremiumButtonProps } from '../../types/ui.types';

const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  // Base button classes with enhanced micro-interactions
  const baseClasses = 'btn-base font-medium transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform active:scale-95 touch-manipulation';
  
  // Variant classes with enhanced hover effects
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 focus:ring-primary-500 shadow-sm glow-on-hover',
    secondary: 'bg-secondary-500 text-neutral-900 hover:bg-secondary-600 hover:shadow-lg hover:-translate-y-0.5 focus:ring-secondary-500 shadow-sm',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:shadow-md hover:-translate-y-0.5 focus:ring-primary-500 bg-white backdrop-blur-sm',
    ghost: 'text-primary-600 hover:bg-primary-50 hover:shadow-sm focus:ring-primary-500 bg-transparent'
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg'
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Loading state classes
  const loadingClasses = loading ? 'cursor-not-allowed opacity-75' : '';
  
  // Combine all classes
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    loadingClasses,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon ? (
          <span className="flex items-center">{icon}</span>
        ) : null}
        <span>{children}</span>
      </div>
    </button>
  );
};

export default PremiumButton;
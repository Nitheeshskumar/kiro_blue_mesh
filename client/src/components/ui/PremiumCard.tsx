import React from 'react';
import { PremiumCardProps } from '../../types/ui.types';

const PremiumCard: React.FC<PremiumCardProps> = ({
  elevation = 'medium',
  hover = false,
  padding = 'md',
  className = '',
  children,
  onClick,
  ...props
}) => {
  // Base card classes
  const baseClasses = 'card-base bg-white rounded-xl border border-neutral-200 transition-all duration-base';
  
  // Elevation classes
  const elevationClasses = {
    low: 'shadow-sm',
    medium: 'shadow-base',
    high: 'shadow-lg'
  };
  
  // Hover classes
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 hover:border-neutral-300' : '';
  
  // Padding classes
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  // Interactive classes
  const interactiveClasses = onClick ? 'cursor-pointer hover:bg-neutral-50' : '';
  
  // Combine all classes
  const cardClasses = [
    baseClasses,
    elevationClasses[elevation],
    hoverClasses,
    paddingClasses[padding],
    interactiveClasses,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default PremiumCard;
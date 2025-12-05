import React from 'react';
import { useHalloween } from '../../contexts/HalloweenContext';

interface HalloweenCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const HalloweenCard: React.FC<HalloweenCardProps> = ({ 
  children, 
  className = '', 
  hover = true 
}) => {
  const { isHalloweenMode } = useHalloween();

  const getCardClasses = () => {
    const baseClasses = 'rounded-lg transition-all duration-300';
    const hoverClasses = hover ? 'halloween-hover' : '';
    
    if (!isHalloweenMode) {
      return `${baseClasses} card ${hoverClasses}`;
    }

    return `${baseClasses} ${hoverClasses} bg-gradient-to-br from-halloween-black-900/90 to-halloween-purple-900/90 border border-halloween-orange-500/30 text-white shadow-2xl backdrop-blur-sm`;
  };

  return (
    <div className={`${getCardClasses()} ${className}`}>
      {children}
    </div>
  );
};
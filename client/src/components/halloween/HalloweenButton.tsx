import React from 'react';
import { useHalloween } from '../../contexts/HalloweenContext';

interface HalloweenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'spooky';
  children: React.ReactNode;
}

export const HalloweenButton: React.FC<HalloweenButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}) => {
  const { isHalloweenMode } = useHalloween();

  const getButtonClasses = () => {
    const baseClasses = 'font-light py-2 px-4 rounded-lg transition-all duration-300 halloween-hover';
    
    if (!isHalloweenMode) {
      return variant === 'primary' 
        ? `${baseClasses} btn-primary` 
        : `${baseClasses} btn-secondary`;
    }

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-gradient-to-r from-halloween-orange-600 to-halloween-orange-500 hover:from-halloween-orange-700 hover:to-halloween-orange-600 text-white shadow-lg border border-halloween-orange-400`;
      case 'secondary':
        return `${baseClasses} bg-gradient-to-r from-halloween-purple-600 to-halloween-purple-500 hover:from-halloween-purple-700 hover:to-halloween-purple-600 text-white shadow-lg border border-halloween-purple-400`;
      case 'spooky':
        return `${baseClasses} bg-gradient-to-r from-halloween-black-800 to-halloween-black-700 hover:from-halloween-black-900 hover:to-halloween-black-800 text-halloween-orange-400 shadow-lg border border-halloween-orange-500/50 animate-pulse-glow`;
      default:
        return `${baseClasses} btn-primary`;
    }
  };

  return (
    <button 
      className={`${getButtonClasses()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
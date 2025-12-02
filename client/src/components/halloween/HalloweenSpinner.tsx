import React from 'react';
import { useHalloween } from '../../contexts/HalloweenContext';

interface HalloweenSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HalloweenSpinner: React.FC<HalloweenSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const { isHalloweenMode } = useHalloween();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-8 h-8';
      case 'lg': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };

  if (!isHalloweenMode) {
    return (
      <div className={`${getSizeClasses()} border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin ${className}`} />
    );
  }

  return (
    <div className={`relative ${getSizeClasses()} ${className}`}>
      {/* Pumpkin Spinner */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-halloween-orange-500 animate-bounce-slow text-2xl">🎃</span>
      </div>
      <div className="w-full h-full border-2 border-halloween-orange-500/30 border-t-halloween-orange-500 rounded-full animate-spin loading-spinner" />
    </div>
  );
};
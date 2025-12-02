import React from 'react';
import { useHalloween } from '../../contexts/HalloweenContext';

interface HalloweenTextProps {
  children: React.ReactNode;
  variant?: 'normal' | 'spooky' | 'glow';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

export const HalloweenText: React.FC<HalloweenTextProps> = ({ 
  children, 
  variant = 'normal',
  className = '',
  as: Component = 'p'
}) => {
  const { isHalloweenMode } = useHalloween();

  const getTextClasses = () => {
    if (!isHalloweenMode) {
      return className;
    }

    switch (variant) {
      case 'spooky':
        return `text-halloween-orange-600 ${className}`;
      case 'glow':
        return `text-halloween-orange-500 animate-fade-in-out ${className}`;
      default:
        return `text-halloween-black-800 ${className}`;
    }
  };

  return (
    <Component className={getTextClasses()}>
      {children}
    </Component>
  );
};
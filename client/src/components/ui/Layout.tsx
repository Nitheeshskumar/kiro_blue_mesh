import React from 'react';
import { ContainerProps, GridProps, FlexProps } from '../../types/ui.types';

// Container Component
export const Container: React.FC<ContainerProps> = ({
  maxWidth = 'xl',
  padding = true,
  className = '',
  children,
  ...props
}) => {
  // Max width classes
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  };
  
  // Padding classes
  const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8' : '';
  
  // Combine classes
  const containerClasses = [
    'mx-auto',
    maxWidthClasses[maxWidth],
    paddingClasses,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
};

// Grid Component
export const Grid: React.FC<GridProps> = ({
  cols = 1,
  gap = 'md',
  responsive = true,
  className = '',
  children,
  ...props
}) => {
  // Grid columns classes
  const colsClasses = {
    1: 'grid-cols-1',
    2: responsive ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2',
    3: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
    4: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4',
    5: responsive ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-5',
    6: responsive ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-6',
    12: responsive ? 'grid-cols-1 md:grid-cols-6 lg:grid-cols-12' : 'grid-cols-12'
  };
  
  // Gap classes
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };
  
  // Combine classes
  const gridClasses = [
    'grid',
    colsClasses[cols],
    gapClasses[gap],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

// Flex Component
export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'md',
  className = '',
  children,
  ...props
}) => {
  // Direction classes
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col'
  };
  
  // Align classes
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };
  
  // Justify classes
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };
  
  // Gap classes
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };
  
  // Wrap classes
  const wrapClasses = wrap ? 'flex-wrap' : '';
  
  // Combine classes
  const flexClasses = [
    'flex',
    directionClasses[direction],
    alignClasses[align],
    justifyClasses[justify],
    gapClasses[gap],
    wrapClasses,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={flexClasses} {...props}>
      {children}
    </div>
  );
};
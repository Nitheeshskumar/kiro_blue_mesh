import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// Button Component Types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface PremiumButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

// Card Component Types
export type CardElevation = 'low' | 'medium' | 'high';
export type CardPadding = 'sm' | 'md' | 'lg';

export interface PremiumCardProps {
  elevation?: CardElevation;
  hover?: boolean;
  padding?: CardPadding;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

// Input Component Types
export type InputVariant = 'default' | 'error' | 'success';
export type InputSize = 'sm' | 'md' | 'lg';

export interface PremiumInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

// Layout Component Types
export interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export interface ContainerProps extends LayoutProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

export interface GridProps extends LayoutProps {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

export interface FlexProps extends LayoutProps {
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg';
}
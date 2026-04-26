import React from 'react';
import { useSEO } from '../hooks/useSEO';

interface SEOProps {
  title: string;
  description?: string;
  url?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, url }) => {
  useSEO({ title, description, url });
  
  // This component doesn't render anything visible
  return null;
};

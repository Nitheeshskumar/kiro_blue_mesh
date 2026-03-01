/**
 * Converts Supabase storage URLs to proxied URLs for Indian ISP compatibility
 */
import React from 'react';

export const getProxiedImageUrl = (originalUrl: string): string => {
  if (!originalUrl) return '';
  
  // If it's already a proxied URL, return as is
  if (originalUrl.includes('/.netlify/functions/image-proxy')) {
    return originalUrl;
  }
  
  // If it's a Supabase storage URL, proxy it
  if (originalUrl.includes('supabase.co/storage/')) {
    // Add cache-busting parameter for development
    const cacheBust = process.env.NODE_ENV === 'development' ? `&t=${Date.now()}` : '';
    return `/.netlify/functions/image-proxy?url=${encodeURIComponent(originalUrl)}${cacheBust}`;
  }
  
  // For other URLs, return as is
  return originalUrl;
};

/**
 * Batch convert multiple image URLs
 */
export const getProxiedImageUrls = (urls: string[]): string[] => {
  return urls.map(getProxiedImageUrl);
};

/**
 * Get multiple image variants (thumbnail, medium, full)
 */
export const getImageVariants = (baseUrl: string) => {
  const proxiedUrl = getProxiedImageUrl(baseUrl);
  
  return {
    thumbnail: proxiedUrl,
    medium: proxiedUrl,
    full: proxiedUrl
  };
};

/**
 * React hook for handling image URLs with fallback
 */
export const useImageUrl = (url: string, fallback?: string) => {
  const [imageUrl, setImageUrl] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (!url) {
      setImageUrl(fallback || '');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    
    const proxiedUrl = getProxiedImageUrl(url);
    
    // Test if image loads
    const img = new Image();
    img.onload = () => {
      setImageUrl(proxiedUrl);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageUrl(fallback || '');
      setHasError(true);
      setIsLoading(false);
    };
    img.src = proxiedUrl;
  }, [url, fallback]);

  return { imageUrl, isLoading, hasError };
};
import React from 'react';
import { getProxiedImageUrl } from '../../lib/imageUtils';

interface ProxiedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  showLoader?: boolean;
}

export const ProxiedImage: React.FC<ProxiedImageProps> = ({
  src,
  fallback = '/placeholder-image.jpg',
  showLoader = true,
  className = '',
  alt = '',
  ...props
}) => {
  const [imageUrl, setImageUrl] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (!src) {
      setImageUrl(fallback);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    
    const proxiedUrl = getProxiedImageUrl(src);
    
    // Test if image loads
    const img = new Image();
    img.onload = () => {
      setImageUrl(proxiedUrl);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageUrl(fallback);
      setHasError(true);
      setIsLoading(false);
    };
    img.src = proxiedUrl;
  }, [src, fallback]);

  if (isLoading && showLoader) {
    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      {...props}
    />
  );
};
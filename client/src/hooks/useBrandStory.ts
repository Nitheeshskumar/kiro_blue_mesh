import { useState, useEffect } from 'react';
import { BrandStory } from '../types/brandStory.types';
import { brandStoryData } from '../data/brandStory';

interface UseBrandStoryReturn {
  brandStory: BrandStory | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBrandStory = (): UseBrandStoryReturn => {
  const [brandStory, setBrandStory] = useState<BrandStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrandStory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call delay for realistic loading experience
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real application, this would be an API call
      // const response = await fetch('/api/brand-story');
      // const data = await response.json();
      
      setBrandStory(brandStoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brand story');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrandStory();
  }, []);

  const refetch = () => {
    loadBrandStory();
  };

  return {
    brandStory,
    loading,
    error,
    refetch
  };
};
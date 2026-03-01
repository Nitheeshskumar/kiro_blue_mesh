import React, { createContext, useContext, useState, useEffect } from 'react';

interface HalloweenContextType {
  isHalloweenMode: boolean;
  toggleHalloweenMode: () => void;
}

const HalloweenContext = createContext<HalloweenContextType | undefined>(undefined);

export const useHalloween = () => {
  const context = useContext(HalloweenContext);
  if (!context) {
    throw new Error('useHalloween must be used within a HalloweenProvider');
  }
  return context;
};

interface HalloweenProviderProps {
  children: React.ReactNode;
}

export const HalloweenProvider: React.FC<HalloweenProviderProps> = ({ children }) => {
  const [isHalloweenMode, setIsHalloweenMode] = useState(() => {
    // Check if Halloween mode is enabled in localStorage
    const saved = localStorage.getItem('halloween-mode');
   return false;
    // return saved ? JSON.parse(saved) : true; // Default to true for Halloween season
  });

  useEffect(() => {
    // localStorage.setItem('halloween-mode', JSON.stringify(isHalloweenMode));
    
    // Add/remove Halloween class to body
    if (isHalloweenMode) {
      document.body.classList.add('halloween-mode');
    } else {
      document.body.classList.remove('halloween-mode');
    }
  }, [isHalloweenMode]);

  const toggleHalloweenMode = () => {
    setIsHalloweenMode(!isHalloweenMode);
  };

  return (
    <HalloweenContext.Provider value={{ isHalloweenMode, toggleHalloweenMode }}>
      {children}
    </HalloweenContext.Provider>
  );
};
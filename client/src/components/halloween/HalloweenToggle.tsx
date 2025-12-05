import React from 'react';
import { useHalloween } from '../../contexts/HalloweenContext';

export const HalloweenToggle: React.FC = () => {
  const { isHalloweenMode, toggleHalloweenMode } = useHalloween();

  return (
    <button
      onClick={toggleHalloweenMode}
      className={`
        relative inline-flex items-center justify-center p-2 rounded-full transition-all duration-300
        ${isHalloweenMode 
          ? 'bg-halloween-orange-500 text-white shadow-lg hover:bg-halloween-orange-600 animate-pulse-glow' 
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }
      `}
      title={isHalloweenMode ? 'Disable Halloween Mode' : 'Enable Halloween Mode'}
    >
      <span className="text-xl">
        {isHalloweenMode ? '🎃' : '👻'}
      </span>
      {isHalloweenMode && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-halloween-orange-600 rounded-full animate-ping"></span>
      )}
    </button>
  );
};
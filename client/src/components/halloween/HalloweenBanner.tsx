import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useHalloween } from '../../contexts/HalloweenContext';

export const HalloweenBanner: React.FC = () => {
  const { isHalloweenMode } = useHalloween();
  const [isVisible, setIsVisible] = useState(true);

  if (!isHalloweenMode || !isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-halloween-orange-600 via-halloween-black-800 to-halloween-orange-600 text-white py-3 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-2 animate-fade-in-out">
          <span className="text-xl animate-bounce-slow">🎃</span>
          <span className="font-medium">
            Halloween Special: Get spooky with our custom designs! Limited time Halloween embroidery options available.
          </span>
          <span className="text-xl animate-bounce-slow">👻</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/80 hover:text-white transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Floating Halloween elements */}
      <div className="absolute top-1 left-10 text-halloween-orange-300/30 animate-float">🦇</div>
      <div className="absolute top-2 right-20 text-halloween-orange-300/30 animate-float" style={{ animationDelay: '1s' }}>🕷️</div>
      <div className="absolute top-1 left-1/3 text-halloween-orange-300/30 animate-float" style={{ animationDelay: '2s' }}>🍂</div>
    </div>
  );
};
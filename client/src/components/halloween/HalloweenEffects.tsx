import React, { useEffect, useState } from 'react';
import { useHalloween } from '../../contexts/HalloweenContext';

// Floating Ghost Component
const FloatingGhost: React.FC<{ delay?: number }> = ({ delay = 0 }) => (
  <div 
    className="fixed pointer-events-none z-10 text-white/20 text-4xl animate-float"
    style={{
      left: `${Math.random() * 80 + 10}%`,
      top: `${Math.random() * 60 + 20}%`,
      animationDelay: `${delay}s`
    }}
  >
    👻
  </div>
);

// Flying Bat Component
const FlyingBat: React.FC<{ delay?: number }> = ({ delay = 0 }) => (
  <div 
    className="fixed pointer-events-none z-10 text-halloween-black-800/30 text-2xl animate-fly-across"
    style={{
      top: `${Math.random() * 40 + 10}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${8 + Math.random() * 4}s`
    }}
  >
    🦇
  </div>
);

// Pumpkin Decoration
const PumpkinDecor: React.FC<{ position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }> = ({ position }) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} pointer-events-none z-10 text-halloween-orange-500 text-3xl animate-pulse-glow`}>
      🎃
    </div>
  );
};

// Spider Web Corner
const SpiderWeb: React.FC<{ corner: 'top-left' | 'top-right' }> = ({ corner }) => (
  <div className={`fixed ${corner === 'top-left' ? 'top-0 left-0' : 'top-0 right-0'} pointer-events-none z-10`}>
    <svg 
      width="120" 
      height="120" 
      viewBox="0 0 120 120" 
      className="text-halloween-black-600/20"
      style={{ transform: corner === 'top-right' ? 'scaleX(-1)' : 'none' }}
    >
      <path 
        d="M0,0 L60,30 L120,0 M0,20 L50,40 L100,20 M0,40 L40,50 L80,40 M20,0 L30,60 M40,0 L40,50 M60,0 L50,40 M80,0 L60,30" 
        stroke="currentColor" 
        strokeWidth="1" 
        fill="none"
        opacity="0.3"
      />
    </svg>
  </div>
);

// Falling Leaves
const FallingLeaf: React.FC<{ delay?: number }> = ({ delay = 0 }) => (
  <div 
    className="fixed pointer-events-none z-10 text-halloween-orange-600/40 text-2xl animate-spider-drop"
    style={{
      left: `${Math.random() * 100}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${6 + Math.random() * 4}s`
    }}
  >
    🍂
  </div>
);

export const HalloweenEffects: React.FC = () => {
  const { isHalloweenMode } = useHalloween();
  const [effects, setEffects] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (!isHalloweenMode) {
      setEffects([]);
      return;
    }

    const newEffects: React.ReactNode[] = [];

    // Add floating ghosts
    for (let i = 0; i < 3; i++) {
      newEffects.push(<FloatingGhost key={`ghost-${i}`} delay={i * 2} />);
    }

    // Add flying bats
    for (let i = 0; i < 4; i++) {
      newEffects.push(<FlyingBat key={`bat-${i}`} delay={i * 3} />);
    }

    // Add pumpkin decorations
    newEffects.push(<PumpkinDecor key="pumpkin-tl" position="top-left" />);
    newEffects.push(<PumpkinDecor key="pumpkin-br" position="bottom-right" />);

    // Add spider webs
    newEffects.push(<SpiderWeb key="web-tl" corner="top-left" />);
    newEffects.push(<SpiderWeb key="web-tr" corner="top-right" />);

    // Add falling leaves
    for (let i = 0; i < 5; i++) {
      newEffects.push(<FallingLeaf key={`leaf-${i}`} delay={i * 1.5} />);
    }

    setEffects(newEffects);
  }, [isHalloweenMode]);

  if (!isHalloweenMode) return null;

  return (
    <div className="halloween-effects">
      {effects}
    </div>
  );
};
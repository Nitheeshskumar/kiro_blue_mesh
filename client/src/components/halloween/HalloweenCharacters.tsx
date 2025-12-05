import React, { useEffect, useState, useCallback } from 'react';
import { useHalloween } from '../../contexts/HalloweenContext';

interface Character {
  id: number;
  type: 'ghost' | 'frankenstein';
  x: number;
  y: number;
  isVisible: boolean;
}

export const HalloweenCharacters: React.FC = () => {
  const { isHalloweenMode } = useHalloween();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterId, setCharacterId] = useState(0);

  // Sound effects using Web Audio API
  const playGhostSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Ghost "BOO!" sound - quick frequency sweep
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported');
    }
  }, []);

  const playFrankensteinSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Frankenstein "groan" - low frequency rumble
      oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(60, audioContext.currentTime + 0.5);
      oscillator.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.5);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    } catch (error) {
      console.log('Audio not supported');
    }
  }, []);

  const spawnGhost = useCallback(() => {
    const newGhost: Character = {
      id: characterId,
      type: 'ghost',
      x: Math.random() * (window.innerWidth - 100),
      y: Math.random() * (window.innerHeight - 200) + 100,
      isVisible: true
    };

    setCharacters(prev => [...prev, newGhost]);
    setCharacterId(prev => prev + 1);
    playGhostSound();

    // Remove ghost after animation
    setTimeout(() => {
      setCharacters(prev => prev.filter(char => char.id !== newGhost.id));
    }, 3000);
  }, [characterId, playGhostSound]);

  const spawnFrankenstein = useCallback(() => {
    const newFrankenstein: Character = {
      id: characterId,
      type: 'frankenstein',
      x: -150,
      y: Math.random() * (window.innerHeight - 300) + 200,
      isVisible: true
    };

    setCharacters(prev => [...prev, newFrankenstein]);
    setCharacterId(prev => prev + 1);
    playFrankensteinSound();

    // Remove Frankenstein after walking across
    setTimeout(() => {
      setCharacters(prev => prev.filter(char => char.id !== newFrankenstein.id));
    }, 8000);
  }, [characterId, playFrankensteinSound]);

  useEffect(() => {
    if (!isHalloweenMode) {
      setCharacters([]);
      return;
    }

    // Random character spawning with varying intervals
    const spawnInterval = setInterval(() => {
      const random = Math.random();
      
      if (random < 0.4) { // 40% chance for ghost
        spawnGhost();
      } else if (random < 0.6) { // 20% chance for Frankenstein
        spawnFrankenstein();
      }
      // 40% chance nothing happens (keeps it from being too overwhelming)
    }, Math.random() * 10000 + 8000); // Random interval between 8-18 seconds

    // Initial spawn after a short delay
    const initialSpawn = setTimeout(() => {
      if (Math.random() < 0.5) {
        spawnGhost();
      } else {
        spawnFrankenstein();
      }
    }, 3000);

    return () => {
      clearInterval(spawnInterval);
      clearTimeout(initialSpawn);
    };
  }, [isHalloweenMode, spawnGhost, spawnFrankenstein]);

  if (!isHalloweenMode) return null;

  return (
    <div className="halloween-characters">
      {characters.map((character) => {
        if (character.type === 'ghost') {
          const ghostVariations = ['👻', '🤍', '💀'];
          const ghostEmoji = ghostVariations[character.id % ghostVariations.length];
          
          return (
            <div
              key={character.id}
              className="fixed pointer-events-auto z-40 text-6xl cursor-pointer transition-transform hover:scale-110"
              style={{
                left: character.x,
                top: character.y,
                animation: 'ghostPopUp 3s ease-in-out forwards',
                filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))'
              }}
              onClick={() => {
                playGhostSound();
                // Add a little shake effect on click
                const element = document.getElementById(`ghost-${character.id}`);
                if (element) {
                  element.style.animation = 'spookyShake 0.5s ease-in-out';
                }
              }}
              id={`ghost-${character.id}`}
              title="BOO! 👻"
            >
              {ghostEmoji}
            </div>
          );
        }

        if (character.type === 'frankenstein') {
          const frankensteinVariations = ['🧟‍♂️', '🧟‍♀️', '🧛‍♂️'];
          const frankensteinEmoji = frankensteinVariations[character.id % frankensteinVariations.length];
          
          return (
            <div
              key={character.id}
              className="fixed pointer-events-auto z-40 text-6xl cursor-pointer transition-transform hover:scale-110"
              style={{
                left: character.x,
                top: character.y,
                animation: 'frankensteinWalk 8s linear forwards',
                filter: 'drop-shadow(0 0 15px rgba(0, 100, 0, 0.5))'
              }}
              onClick={() => {
                playFrankensteinSound();
              }}
              title="Grrrr... 🧟‍♂️"
            >
              {frankensteinEmoji}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
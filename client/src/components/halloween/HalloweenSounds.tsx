import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useHalloween } from "../../contexts/HalloweenContext";

export const HalloweenSounds: React.FC = () => {
  const { isHalloweenMode } = useHalloween();
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  const playSpookySound = () => {
    if (!isSoundEnabled || !isHalloweenMode) return;

    // Create a simple spooky sound using Web Audio API
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a spooky "whoosh" sound
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      50,
      audioContext.currentTime + 0.5
    );

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  React.useEffect(() => {
    if (!isHalloweenMode || !isSoundEnabled) return;

    const handleClick = () => {
      if (Math.random() < 0.1) {
        // 10% chance to play sound on click
        playSpookySound();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isHalloweenMode, isSoundEnabled]);

  if (!isHalloweenMode) return null;

  return (
    <button
      onClick={() => setIsSoundEnabled(!isSoundEnabled)}
      className={`
        fixed bottom-4 right-4 p-3 rounded-full transition-all duration-300 z-50
        ${
          isSoundEnabled
            ? "bg-halloween-orange-500 text-white shadow-lg animate-pulse-glow"
            : "bg-gray-600 text-gray-300 hover:bg-gray-500"
        }
      `}
      title={isSoundEnabled ? "Disable Spooky Sounds" : "Enable Spooky Sounds"}
    >
      {isSoundEnabled ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
    </button>
  );
};

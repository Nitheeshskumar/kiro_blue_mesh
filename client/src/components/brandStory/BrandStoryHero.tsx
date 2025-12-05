import React from 'react';
import { ChevronDown } from 'lucide-react';

interface BrandStoryHeroProps {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    video?: string;
  };
}

export const BrandStoryHero: React.FC<BrandStoryHeroProps> = ({ hero }) => {
  const scrollToTimeline = () => {
    const timelineSection = document.getElementById('timeline');
    if (timelineSection) {
      timelineSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${hero.backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          {hero.title}
        </h1>
        <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-90">
          {hero.subtitle}
        </p>
        
        {/* Call to Action */}
        <button
          onClick={scrollToTimeline}
          className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300 group"
        >
          Discover Our Story
          <ChevronDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onClick={scrollToTimeline}
          className="text-white opacity-70 hover:opacity-100 transition-opacity duration-300 animate-bounce"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
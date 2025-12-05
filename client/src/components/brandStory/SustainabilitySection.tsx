import React, { useState, useEffect, useRef } from 'react';
import { SustainabilityInfo } from '../../types/brandStory.types';
import { ExternalLink, Award } from 'lucide-react';

interface SustainabilitySectionProps {
  sustainability: SustainabilityInfo;
}

export const SustainabilitySection: React.FC<SustainabilitySectionProps> = ({ sustainability }) => {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const itemId = entry.target.getAttribute('data-item-id');
            if (itemId) {
              setVisibleItems(prev => new Set([...prev, itemId]));
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    const itemElements = sectionRef.current?.querySelectorAll('[data-item-id]');
    itemElements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="space-y-16">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {sustainability.title}
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {sustainability.description}
        </p>
      </div>

      {/* Commitments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {sustainability.commitments.map((commitment, index) => {
          const isVisible = visibleItems.has(commitment.id);

          return (
            <div
              key={commitment.id}
              data-item-id={commitment.id}
              className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-500 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Icon */}
              <div className="text-4xl mb-4 text-center">
                {commitment.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                {commitment.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 text-center leading-relaxed">
                {commitment.description}
              </p>

              {/* Progress Bar */}
              {commitment.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-primary-600">
                      {commitment.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: isVisible ? `${commitment.progress}%` : '0%',
                        transitionDelay: `${index * 150 + 500}ms`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Certifications */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Our Certifications
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sustainability.certifications.map((cert, index) => {
            const isVisible = visibleItems.has(`cert-${cert.id}`);

            return (
              <div
                key={cert.id}
                data-item-id={`cert-${cert.id}`}
                className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-500 ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200 + 800}ms` }}
              >
                <div className="flex items-start space-x-4">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Award className="w-8 h-8 text-primary-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {cert.name}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {cert.description}
                    </p>
                    
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        <span>Learn more</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <div 
        data-item-id="cta"
        className={`text-center transition-all duration-500 ${
          visibleItems.has('cta') ? 'animate-fade-in-up' : 'opacity-0'
        }`}
      >
        <div className="bg-primary-600 text-white rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">
            Join Our Sustainable Fashion Journey
          </h3>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Every purchase you make supports our commitment to environmental responsibility 
            and ethical manufacturing practices.
          </p>
          <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
            Shop Sustainable Fashion
          </button>
        </div>
      </div>
    </div>
  );
};
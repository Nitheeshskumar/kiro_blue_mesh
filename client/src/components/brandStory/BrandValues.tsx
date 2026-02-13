import React, { useState, useEffect, useRef } from 'react';
import { BrandValue } from '../../types/brandStory.types';

interface BrandValuesProps {
  values: BrandValue[];
}

export const BrandValues: React.FC<BrandValuesProps> = ({ values }) => {
  const [visibleValues, setVisibleValues] = useState<Set<string>>(new Set());
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const valuesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const valueId = entry.target.getAttribute('data-value-id');
            if (valueId) {
              setVisibleValues(prev => new Set([...prev, valueId]));
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    const valueElements = valuesRef.current?.querySelectorAll('[data-value-id]');
    valueElements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={valuesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {values.map((value, index) => {
        const isVisible = visibleValues.has(value.id);
        const isHovered = hoveredValue === value.id;

        return (
          <div
            key={value.id}
            data-value-id={value.id}
            className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 hover:shadow-2xl ${
              isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
            onMouseEnter={() => setHoveredValue(value.id)}
            onMouseLeave={() => setHoveredValue(null)}
          >
            {/* Background Image */}
            {value.image && (
              <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                <img
                  src={value.image}
                  alt={value.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              </div>
            )}

            {/* Content */}
            <div className="relative z-10 p-6 h-80 flex flex-col justify-end text-white">
             

              {/* Title */}
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary-300 transition-colors duration-300">
                {value.title}
              </h3>

              {/* Description */}
              <p className={`text-gray-200 leading-relaxed transition-all duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-90'
              }`}>
                {value.description}
              </p>

              {/* Hover Effect Overlay */}
              <div className={`absolute inset-0 bg-primary-600/20 transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}></div>
            </div>

            {/* Decorative Border */}
            <div className={`absolute inset-0 border-2 border-transparent rounded-2xl transition-all duration-300 ${
              isHovered ? 'border-primary-400 shadow-lg shadow-primary-400/25' : ''
            }`}></div>
          </div>
        );
      })}
    </div>
  );
};
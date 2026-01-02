import React, { useState, useEffect, useRef } from 'react';
import { TimelineEvent } from '../../types/brandStory.types';
import { OptimizedImage } from './OptimizedImage';

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const [visibleEvents, setVisibleEvents] = useState<Set<string>>(new Set());
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const eventId = entry.target.getAttribute('data-event-id');
            if (eventId) {
              setVisibleEvents(prev => new Set([...prev, eventId]));
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const eventElements = timelineRef.current?.querySelectorAll('[data-event-id]');
    eventElements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={timelineRef} className="relative">
      {/* Timeline Line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-primary-600 to-primary-400 h-full hidden md:block"></div>

      {/* Events */}
      <div className="space-y-12 md:space-y-16">
        {events.map((event, index) => {
          const isLeft = index % 2 === 0;
          const isVisible = visibleEvents.has(event.id);

          return (
            <div
              key={event.id}
              data-event-id={event.id}
              className={`relative flex items-center ${
                isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
              } ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 z-10 hidden md:block">
                <div
                  className={`w-6 h-6 rounded-full border-4 border-white transition-all duration-300 ${
                    event.milestone
                      ? 'bg-primary-600 shadow-lg scale-125'
                      : 'bg-gray-400'
                  }`}
                ></div>
              </div>

              {/* Content */}
              <div className={`w-full md:w-5/12 ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  {/* Image */}
                  <div className="aspect-video overflow-hidden">
                    <OptimizedImage
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full transition-transform duration-300 hover:scale-105"
                      width={600}
                      height={400}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold">
                        {event.year}
                      </span>
                      {event.milestone && (
                        <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                          Milestone
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Spacer for the other side */}
              <div className="hidden md:block w-5/12"></div>
            </div>
          );
        })}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center mt-12 space-x-2">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => {
              const element = document.querySelector(`[data-event-id="${event.id}"]`);
              element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              visibleEvents.has(event.id)
                ? 'bg-primary-600 scale-125'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
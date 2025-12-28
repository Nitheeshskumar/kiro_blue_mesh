import React, { useState, useEffect, useRef } from 'react';
import { TeamMember } from '../../types/brandStory.types';
import { Crown } from 'lucide-react';

interface TeamSectionProps {
  team: TeamMember[];
}

export const TeamSection: React.FC<TeamSectionProps> = ({ team }) => {
  const [visibleMembers, setVisibleMembers] = useState<Set<string>>(new Set());
  const teamRef = useRef<HTMLDivElement>(null);

  // Sort team to show founders first
  const sortedTeam = [...team].sort((a, b) => {
    if (a.isFounder && !b.isFounder) return -1;
    if (!a.isFounder && b.isFounder) return 1;
    return 0;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const memberId = entry.target.getAttribute('data-member-id');
            if (memberId) {
              setVisibleMembers(prev => new Set([...prev, memberId]));
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const memberElements = teamRef.current?.querySelectorAll('[data-member-id]');
    memberElements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={teamRef}>
      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedTeam.map((member, index) => {
          const isVisible = visibleMembers.has(member.id);

          return (
            <div
              key={member.id}
              data-member-id={member.id}
              className={`group transition-all duration-500 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Founder Badge */}
                  {member.isFounder && (
                    <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full flex items-center space-x-1 text-sm font-medium">
                      <Crown className="w-4 h-4" />
                      <span>Founder</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
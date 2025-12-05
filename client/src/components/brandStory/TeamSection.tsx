import React, { useState, useEffect, useRef } from 'react';
import { TeamMember } from '../../types/brandStory.types';
import { Crown, Linkedin, Mail } from 'lucide-react';

interface TeamSectionProps {
  team: TeamMember[];
}

export const TeamSection: React.FC<TeamSectionProps> = ({ team }) => {
  const [visibleMembers, setVisibleMembers] = useState<Set<string>>(new Set());
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {sortedTeam.map((member, index) => {
          const isVisible = visibleMembers.has(member.id);

          return (
            <div
              key={member.id}
              data-member-id={member.id}
              className={`group cursor-pointer transition-all duration-500 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
              onClick={() => setSelectedMember(member)}
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

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <button className="w-full bg-white text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
                        Read Full Bio
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 line-clamp-3 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header Image */}
              <div className="aspect-video overflow-hidden rounded-t-2xl">
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {selectedMember.name}
                  </h2>
                  {selectedMember.isFounder && (
                    <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full flex items-center space-x-1 text-sm font-medium">
                      <Crown className="w-4 h-4" />
                      <span>Founder</span>
                    </div>
                  )}
                </div>
                
                <p className="text-xl text-primary-600 font-medium mb-6">
                  {selectedMember.role}
                </p>
                
                <p className="text-gray-700 leading-relaxed text-lg mb-8">
                  {selectedMember.bio}
                </p>

                {/* Contact Actions */}
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                    <Mail className="w-5 h-5" />
                    <span>Contact</span>
                  </button>
                  <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <Linkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
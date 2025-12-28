import React from 'react';
import { useBrandStory } from '../hooks/useBrandStory';
import { 
  BrandStoryHero, 
  Timeline, 
  BrandValues, 
  TeamSection, 
  BrandStoryNavigation 
} from '../components/brandStory';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { PageTransition } from '../components/ui/PageTransition';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export const BrandStoryPage: React.FC = () => {
  const { brandStory, loading, error, refetch } = useBrandStory();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !brandStory) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <ErrorMessage 
          message={error || 'Failed to load brand story'} 
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        {/* Breadcrumb Navigation */}
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb 
              items={[
                { label: 'Our Story', path: '/brand-story' }
              ]} 
            />
          </div>
        </div>

        {/* Section Navigation */}
        <BrandStoryNavigation />

      {/* Hero Section */}
      <section id="hero">
        <BrandStoryHero hero={brandStory.hero} />
      </section>
      
      {/* Timeline Section */}
      <section id="timeline" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From a small home studio to a thriving community of custom clothing enthusiasts, 
              here's how Willowbrook has grown over the years.
            </p>
          </div>
          <Timeline events={brandStory.timeline} />
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do, from design to delivery.
            </p>
          </div>
          <BrandValues values={brandStory.values} />
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The passionate people behind Willowbrook who make it all possible.
            </p>
          </div>
          <TeamSection team={brandStory.team} />
        </div>
      </section>
      </div>
    </PageTransition>
  );
};
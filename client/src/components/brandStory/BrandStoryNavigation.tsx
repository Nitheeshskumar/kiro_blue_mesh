import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'hero', label: 'Our Story', href: '#hero' },
  { id: 'timeline', label: 'Journey', href: '#timeline' },
  { id: 'values', label: 'Values', href: '#values' },
  { id: 'team', label: 'Team', href: '#team' }
];

export const BrandStoryNavigation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
    );

    navigationItems.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed navigation
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:block fixed top-1/2 right-8 transform -translate-y-1/2 z-40">
        <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-2">
          <nav className="flex flex-col space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`group relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  activeSection === item.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                {item.label}
                
                {/* Tooltip */}
                <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {item.label}
                  </div>
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-20 right-4 z-40">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 min-w-[200px]">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </>
  );
};

import React from 'react';
import SearchBar, { SearchFilters } from './SearchBar';

interface HeroProps {
  onSearch?: (filters: SearchFilters) => void;
}

const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const handleSearch = (filters: SearchFilters) => {
    console.log('Search initiated with filters:', filters);
    
    // If no onSearch prop provided, scroll to properties section
    if (!onSearch) {
      const propertiesSection = document.querySelector('#properties');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onSearch(filters);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* High-Quality Background Image with Overlay */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        {/* Dark Overlay for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/40"></div>
        {/* Additional Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Header Section */}
        <div className="text-center mb-12 lg:mb-16 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6 font-display">
            <span className="block mb-2 drop-shadow-lg">Find Your Perfect</span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent drop-shadow-lg">
              Property
            </span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
            Discover premium real estate opportunities with our comprehensive platform
          </p>
        </div>

        {/* Search Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Trust Indicators - Mobile Optimized with White Text */}
        <div className="text-center mt-8 sm:mt-12 lg:mt-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {/* Mobile: Stacked in 2 rows with white text */}
          <div className="flex sm:hidden flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg"></div>
                <span className="font-medium text-sm text-white">Verified Properties</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
                <div className="w-2 h-2 bg-blue-400 rounded-full shadow-lg"></div>
                <span className="font-medium text-sm text-white">Trusted Listings</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
              <div className="w-2 h-2 bg-purple-400 rounded-full shadow-lg"></div>
              <span className="font-medium text-sm text-white">Expert Support</span>
            </div>
          </div>
          
          {/* Desktop: Single row */}
          <div className="hidden sm:flex flex-wrap justify-center items-center gap-6 sm:gap-8 text-sm text-gray-200">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg"></div>
              <span className="font-medium">Verified Properties</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <div className="w-2 h-2 bg-blue-400 rounded-full shadow-lg"></div>
              <span className="font-medium">Trusted Listings</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <div className="w-2 h-2 bg-purple-400 rounded-full shadow-lg"></div>
              <span className="font-medium">Expert Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden sm:block animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center backdrop-blur-sm">
          <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

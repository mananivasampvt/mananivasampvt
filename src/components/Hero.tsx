
import React from 'react';
import SearchBar, { SearchFilters } from './SearchBar';
import { Shield, CheckCircle2, Headphones } from 'lucide-react';

interface HeroProps {
  onSearch?: (filters: SearchFilters) => void;
}

const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const handleSearch = (filters: SearchFilters) => {
    console.log('Search initiated with filters:', filters);
    
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 bg-white">
      {/* Background with Image and Overlay */}
      <div className="absolute inset-0">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/hero-house.jpg')`,
            backgroundPosition: 'center right'
          }}
        />
        {/* Premium Gradient Overlay - Left to Right */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/30"></div>
        
        {/* Subtle organic blob shapes */}
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute -top-40 right-1/2 w-80 h-80 bg-gradient-to-br from-teal-100/20 to-emerald-100/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Mobile Layout - Form First */}
        <div className="lg:hidden space-y-8">
          {/* Mobile Search Card - At Top */}
          <div className="relative mx-auto max-w-2xl animate-fade-in-up">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 p-6">
              {/* Subtle gradient background inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-transparent rounded-3xl pointer-events-none"></div>
              
              <div className="relative z-10">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl font-bold text-slate-900 leading-tight tracking-tight">
              Find Your <br />
              <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                Perfect Property
              </span>
            </h1>
          </div>

          {/* Trust Indicators - Small Horizontal */}
          <div className="flex flex-row gap-3 pt-2 justify-start">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 bg-emerald-50 rounded-lg">
                <Shield className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-medium text-slate-700">Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 bg-emerald-50 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-medium text-slate-700">Trusted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 bg-emerald-50 rounded-lg">
                <Headphones className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-medium text-slate-700">Support</span>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Original */}
        <div className="hidden lg:grid grid-cols-2 gap-8 lg:gap-12 items-start pt-8">
          
          {/* Left Content Section */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Welcome Text - Handwritten style */}
            <div className="relative">
              <p className="text-teal-600 text-xl font-light italic tracking-widest mb-3" style={{ fontFamily: "'Allura', 'Brush Script MT', cursive" }}>Welcome to Mana Nivasam</p>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
                Find Your <br />
                <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                  Perfect Property
                </span>
              </h1>
            </div>
            
            {/* Subheading */}
            <p className="text-lg text-slate-600 leading-relaxed max-w-md font-light">
              Discover premium real estate opportunities with our comprehensive platform
            </p>

            {/* Trust Indicators - Three Pills */}
            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-lg">
                  <Shield className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-slate-700">Verified Properties</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-slate-700">Trusted Listings</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-lg">
                  <Headphones className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-slate-700">Expert Support</span>
              </div>
            </div>
          </div>

          {/* Right Side - Search Card */}
          <div className="animate-fade-in-up relative" style={{ animationDelay: '0.3s' }}>
            <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 p-8">
              {/* Subtle gradient background inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-transparent rounded-3xl pointer-events-none"></div>
              
              <div className="relative z-10">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

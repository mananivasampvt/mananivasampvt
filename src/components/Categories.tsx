
import React, { useEffect } from 'react';
import { Home, Building, MapPin, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Categories = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top when component mounts (for navigation from category cards)
  useEffect(() => {
    if (location.pathname !== '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  const categories = [
    {
      icon: Home,
      title: 'Residential Sale',
      description: 'Houses, Flats & Land',
      count: '250+ Properties',
      gradient: 'from-blue-500 to-purple-600',
      items: ['House for Sale', 'Flat for Sale', 'Land for Sale'],
      route: '/buy'
    },
    {
      icon: Home,
      title: 'Residential Rent',
      description: 'Houses & Apartments',
      count: '180+ Properties',
      gradient: 'from-green-500 to-teal-600',
      items: ['House for Rent', 'Flat for Rent'],
      route: '/rent'
    },
    {
      icon: Building,
      title: 'Commercial',
      description: 'Office & Retail Space',
      count: '120+ Properties',
      gradient: 'from-orange-500 to-red-600',
      items: ['Office for Rent', 'Commercial Space for Rent'],
      route: '/commercial'
    },
    {
      icon: Users,
      title: 'PG & Hostels',
      description: 'Student Accommodation',
      count: '90+ Properties',
      gradient: 'from-pink-500 to-rose-600',
      items: ['PG for Boys', 'PG for Girls', 'Mixed PG'],
      route: '/pg-hostels'
    }
  ];

  const handleCategoryClick = (route: string) => {
    navigate(route);
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Browse by Category
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            Find your perfect property across our diverse range of categories
          </p>
        </div>

        {/* Categories Grid - Mobile Gallery Style */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          {/* Mobile: 2-Column Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:hidden">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div 
                  key={index}
                  onClick={() => handleCategoryClick(category.route)}
                  className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-transparent hover:shadow-lg transition-all duration-300 cursor-pointer aspect-square"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative p-4 h-full flex flex-col justify-between">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Title & Description */}
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">
                        {category.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                        {category.description}
                      </p>
                      
                      {/* Count */}
                      <div className="text-xs font-semibold text-purple-600">
                        {category.count}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tablet & Desktop: Original Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div 
                  key={index}
                  onClick={() => handleCategoryClick(category.route)}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-500 hover-lift cursor-pointer"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Content */}
                  <div className="relative p-8">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {category.description}
                    </p>
                    
                    {/* Count */}
                    <div className="text-sm font-semibold text-purple-600 mb-4">
                      {category.count}
                    </div>
                    
                    {/* Category Items */}
                    <div className="space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                          {item}
                        </div>
                      ))}
                    </div>
                    
                    {/* Hover Arrow */}
                    <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <span className="text-gray-600 font-bold">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;

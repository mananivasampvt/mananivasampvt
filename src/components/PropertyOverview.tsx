
import React from 'react';
import { Bed, Bath, Square, Compass, Home, Building } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  category: string;
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  description: string;
  facing?: string;
}

interface PropertyOverviewProps {
  property: Property;
}

const PropertyOverview: React.FC<PropertyOverviewProps> = ({ property }) => {
  const isLandProperty = property.category === 'Land' || property.type === 'Land' || 
                        property.type === 'Agricultural' || property.type === 'Residential Plot';

  return (
    <div className="font-body">
      <h2 className="text-sm sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-8 font-premium mt-2 sm:mt-0">Property Overview</h2>
      
      {/* Key Metrics with Compact Mobile Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-10">
        {!isLandProperty && property.bedrooms && (
          <div className="text-center p-2 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-2xl shadow-sm sm:shadow-elegant transition-all duration-200 hover:shadow-soft">
            <div className="w-6 h-6 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-3 bg-blue-600 rounded-md sm:rounded-xl flex items-center justify-center">
              <Bed className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-sm sm:text-2xl font-bold text-gray-900 font-premium">{property.bedrooms}</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Bedrooms</div>
          </div>
        )}
        {!isLandProperty && property.bathrooms && (
          <div className="text-center p-2 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-2xl shadow-sm sm:shadow-elegant transition-all duration-200 hover:shadow-soft">
            <div className="w-6 h-6 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-3 bg-purple-600 rounded-md sm:rounded-xl flex items-center justify-center">
              <Bath className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-sm sm:text-2xl font-bold text-gray-900 font-premium">{property.bathrooms}</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Bathrooms</div>
          </div>
        )}
        <div className="text-center p-2 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-2xl shadow-sm sm:shadow-elegant transition-all duration-200 hover:shadow-soft">
          <div className="w-6 h-6 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-3 bg-green-600 rounded-md sm:rounded-xl flex items-center justify-center">
            <Square className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="text-xs sm:text-xl font-bold text-gray-900 font-premium">{property.area}</div>
          <div className="text-xs sm:text-sm text-gray-600 font-medium">Area</div>
        </div>
        {property.facing && (
          <div className="text-center p-2 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg sm:rounded-2xl shadow-sm sm:shadow-elegant transition-all duration-200 hover:shadow-soft">
            <div className="w-6 h-6 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-3 bg-orange-600 rounded-md sm:rounded-xl flex items-center justify-center">
              <Compass className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="text-xs sm:text-lg font-bold text-gray-900 font-premium">{property.facing}</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Facing</div>
          </div>
        )}
      </div>

      {/* Property Type Details with Modern Card - Mobile Responsive */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-8 mb-4 sm:mb-8 shadow-soft border border-gray-100">
        <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
            {property.category === 'Land' ? (
              <Building className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Home className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            )}
          </div>
          <h3 className="text-sm sm:text-xl font-semibold text-gray-900 font-premium">Property Details</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-gray-600 font-medium text-xs sm:text-sm">Category:</span>
            <span className="bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-gray-900 shadow-elegant text-xs sm:text-sm">
              {property.category}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="text-gray-600 font-medium text-xs sm:text-sm">Type:</span>
            <span className="bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-gray-900 shadow-elegant text-xs sm:text-sm">
              {property.type}
            </span>
          </div>
        </div>
      </div>

      {/* Description with Modern Typography - Mobile Responsive */}
      <div>
        <h3 className="text-sm sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-6 font-premium">About This Property</h3>
        <div className="prose text-gray-700 leading-relaxed font-body">
          {property.description.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-2 sm:mb-4 text-gray-600 leading-5 sm:leading-7 text-xs sm:text-base">{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyOverview;

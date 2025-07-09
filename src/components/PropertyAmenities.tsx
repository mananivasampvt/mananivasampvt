
import React from 'react';
import { 
  Wifi, 
  Car, 
  Zap, 
  Droplets, 
  Shield, 
  UtensilsCrossed,
  Dumbbell,
  Trees,
  Camera,
  Wind,
  Sofa,
  Building,
  CheckCircle
} from 'lucide-react';

interface PropertyAmenitiesProps {
  amenities: string[];
}

const PropertyAmenities: React.FC<PropertyAmenitiesProps> = ({ amenities }) => {
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return Wifi;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return Car;
    if (amenityLower.includes('power') || amenityLower.includes('backup') || amenityLower.includes('generator')) return Zap;
    if (amenityLower.includes('water') || amenityLower.includes('supply')) return Droplets;
    if (amenityLower.includes('security') || amenityLower.includes('guard')) return Shield;
    if (amenityLower.includes('kitchen') || amenityLower.includes('meal') || amenityLower.includes('food')) return UtensilsCrossed;
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return Dumbbell;
    if (amenityLower.includes('garden') || amenityLower.includes('park')) return Trees;
    if (amenityLower.includes('cctv') || amenityLower.includes('camera')) return Camera;
    if (amenityLower.includes('ac') || amenityLower.includes('air') || amenityLower.includes('conditioning')) return Wind;
    if (amenityLower.includes('furnished') || amenityLower.includes('furniture')) return Sofa;
    if (amenityLower.includes('lift') || amenityLower.includes('elevator')) return Building;
    
    return CheckCircle;
  };

  const getAmenityColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-blue-500'
    ];
    return colors[index % colors.length];
  };

  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <div className="font-body">
      <h2 className="text-sm sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-8 font-premium mt-2 sm:mt-0">Amenities & Features</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {amenities.map((amenity, index) => {
          const IconComponent = getAmenityIcon(amenity);
          const colorClass = getAmenityColor(index);
          
          return (
            <div key={index} className="group cursor-pointer">
              <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-5 bg-white rounded-lg sm:rounded-2xl shadow-elegant hover:shadow-soft transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className={`flex-shrink-0 w-6 h-6 sm:w-12 sm:h-12 bg-gradient-to-br ${colorClass} rounded-lg sm:rounded-xl flex items-center justify-center shadow-soft`}>
                  <IconComponent className="w-3 h-3 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xs sm:text-base text-gray-900 font-medium group-hover:text-gray-700 transition-colors">{amenity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyAmenities;

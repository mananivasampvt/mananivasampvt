
import React from 'react';
import { 
  Wifi, 
  Car, 
  Zap, 
  Droplets, 
  Shield, 
  TreePine, 
  Dumbbell, 
  Users, 
  UtensilsCrossed, 
  Bed, 
  Gamepad2, 
  Camera,
  CheckCircle,
  Star
} from 'lucide-react';

interface PropertyHighlightsProps {
  highlights: string[];
}

const PropertyHighlights: React.FC<PropertyHighlightsProps> = ({ highlights }) => {
  // Map highlight names to icons and descriptions
  const highlightMapping: Record<string, { icon: React.ComponentType<any>, description: string }> = {
    'wifi': { icon: Wifi, description: 'High-speed internet connectivity' },
    'parking': { icon: Car, description: 'Dedicated parking space' },
    'power_backup': { icon: Zap, description: '24/7 power backup available' },
    'water_supply': { icon: Droplets, description: 'Continuous water supply' },
    'security': { icon: Shield, description: '24/7 security services' },
    'garden': { icon: TreePine, description: 'Beautiful garden area' },
    'gym': { icon: Dumbbell, description: 'Fully equipped gymnasium' },
    'clubhouse': { icon: Users, description: 'Community clubhouse' },
    'kitchen': { icon: UtensilsCrossed, description: 'Modern kitchen facilities' },
    'furnished': { icon: Bed, description: 'Fully furnished property' },
    'play_area': { icon: Gamepad2, description: "Children's play area" },
    'cctv': { icon: Camera, description: 'CCTV surveillance system' },
    'gated_community': { icon: Shield, description: 'Secure gated community' },
    'premium_location': { icon: Star, description: 'Prime location with excellent connectivity' }
  };

  // Get the icon and description for a highlight
  const getHighlightDetails = (highlight: string) => {
    const normalizedHighlight = highlight.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '');
    return highlightMapping[normalizedHighlight] || { icon: CheckCircle, description: highlight };
  };

  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Property Highlights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highlights.map((highlight, index) => {
          const { icon: IconComponent, description } = getHighlightDetails(highlight);
          
          return (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 capitalize">
                  {highlight.replace(/_/g, ' ')}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary Badge */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900">
              {highlights.length} Premium Features Included
            </h3>
            <p className="text-sm text-green-700">
              This property offers exceptional amenities for your comfort and convenience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyHighlights;

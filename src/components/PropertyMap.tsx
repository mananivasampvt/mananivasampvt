
import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyMapProps {
  location: string;
  title: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ location, title }) => {
  const encodedLocation = encodeURIComponent(`${location}, India`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  // Using the standard Google Maps embed URL that doesn't require API key
  const embedUrl = `https://www.google.com/maps?q=${encodedLocation}&output=embed`;

  return (
    <div className="font-body">
      {/* Mobile: Clean header with proper spacing */}
      <div className="p-4 sm:p-6 pb-3 block lg:hidden">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2 font-premium">Location & Map</h3>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <p className="text-sm font-medium break-words">{location}</p>
          </div>
        </div>
      </div>

      {/* Desktop: Full header with icon and title */}
      <div className="p-6 pb-3 hidden lg:block">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-soft">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-premium">Location & Map</h2>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(googleMapsUrl, '_blank')}
            className="flex items-center gap-2 rounded-xl border-gray-200 hover:bg-gray-50 shadow-elegant transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Maps
          </Button>
        </div>
        
        <p className="text-gray-600 mb-4 font-medium">{location}</p>
      </div>

      {/* Map Container - Mobile optimized with working Google Maps embed */}
      <div className="px-4 sm:px-0 pb-4 sm:pb-0">
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-soft border border-gray-200">
          {/* Working Google Maps Embed - No API Key Required */}
          <div className="aspect-[16/9] sm:aspect-[16/10] relative">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
              title={`Map showing ${title} location`}
            />
          </div>
          
          {/* Mobile: Bottom button section with clear visibility */}
          <div className="p-4 bg-gray-50/90 backdrop-blur-sm border-t border-gray-200 lg:hidden">
            <Button 
              onClick={() => window.open(googleMapsUrl, '_blank')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-soft transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 py-3"
            >
              <ExternalLink className="w-4 h-4" />
              View on Google Maps
            </Button>
          </div>
          
          {/* Interactive overlay hint - Desktop only */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 text-xs text-gray-700 shadow-elegant font-medium hidden lg:block">
            📍 View location
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;


import React from 'react';
import { CheckCircle, Star, Heart, Shield } from 'lucide-react';

interface WhyChooseSectionProps {
  highlights?: string[];
  description: string;
  category: string;
}

const WhyChooseSection: React.FC<WhyChooseSectionProps> = ({ 
  highlights = [], 
  description, 
  category 
}) => {
  const generateWhyChoosePoints = () => {
    const points: string[] = [];
    
    // Extract points from highlights
    if (highlights.length > 0) {
      highlights.slice(0, 3).forEach(highlight => {
        switch (highlight.toLowerCase()) {
          case 'security':
            points.push('24/7 Security & Safety');
            break;
          case 'wifi':
            points.push('High-Speed Internet');
            break;
          case 'parking':
            points.push('Secure Parking Available');
            break;
          case 'kitchen':
            points.push('Modern Kitchen Facilities');
            break;
          case 'furnished':
            points.push('Fully Furnished Rooms');
            break;
          case 'premium_location':
            points.push('Prime Location');
            break;
          default:
            points.push(highlight.replace(/_/g, ' '));
        }
      });
    }
    
    // Add category-specific points
    if (category === 'PG/Hostels') {
      if (!points.some(p => p.includes('meal'))) {
        points.push('Hygienic Meal Services');
      }
      if (!points.some(p => p.includes('location'))) {
        points.push('Near Educational Institutions');
      }
    }
    
    // Add generic points if we don't have enough
    while (points.length < 3) {
      const genericPoints = [
        'Excellent Value for Money',
        'Professional Management',
        'Clean & Comfortable Environment'
      ];
      
      for (const point of genericPoints) {
        if (!points.includes(point) && points.length < 3) {
          points.push(point);
        }
      }
    }
    
    return points.slice(0, 4);
  };

  const whyChoosePoints = generateWhyChoosePoints();

  if (whyChoosePoints.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <Star className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Why Choose This Property?</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {whyChoosePoints.map((point, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-1">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700 font-medium">{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyChooseSection;

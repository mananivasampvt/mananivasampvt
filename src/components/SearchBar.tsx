
import React, { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { usePropertyLocations } from '@/hooks/usePropertyLocations';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  categoryFilter?: string; // Add category context for location filtering
}

export interface SearchFilters {
  location: string;
  propertyType: string;
  category: string;
  subCategory?: string;
  manualLocation?: string;
  minPrice?: number;
  maxPrice?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, categoryFilter }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    propertyType: '',
    category: '',
    subCategory: '',
    manualLocation: ''
  });

  const { locationData, loading, error, refetch } = usePropertyLocations();

  // Filter property types to exclude Boys/Girls from main dropdown
  const filteredPropertyTypes = locationData.propertyTypes.filter(
    type => !['Boys', 'Girls'].includes(type)
  );

  // Get locations based on category context
  const getFilteredLocations = () => {
    if (!categoryFilter) {
      return locationData.locations;
    }
    // For now, return all locations but this could be enhanced with backend filtering
    return locationData.locations;
  };

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    console.log(`Updating ${field} to:`, value);
    const filterValue = value === 'all-locations' || value === 'all-types' || value === 'all-categories' ? '' : value;
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [field]: filterValue
      };
      
      // Reset subcategory when category changes
      if (field === 'category' && value !== 'PG/Hostels') {
        newFilters.subCategory = '';
      }
      
      return newFilters;
    });
  };

  const handleSearch = () => {
    const searchFilters = {
      ...filters,
      // Use manual location if provided, otherwise use dropdown selection
      location: filters.manualLocation?.trim() || filters.location
    };
    console.log('Search filters:', searchFilters);
    onSearch(searchFilters);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50/95 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center justify-between shadow-lg">
          <span>{error}</span>
          <Button
            onClick={refetch}
            size="sm"
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-100 h-8"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Main Search Form */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-6 lg:p-8">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-4 items-end">
          {/* Location Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Location</label>
            <Select 
              value={filters.location || 'all-locations'} 
              onValueChange={(value) => handleInputChange('location', value)}
              disabled={loading}
            >
              <SelectTrigger className="w-full h-12 bg-gray-50/80 border border-gray-300 rounded-xl hover:bg-gray-100/80 disabled:opacity-50 backdrop-blur-sm">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] max-h-60">
                <SelectItem value="all-locations" className="text-gray-600">
                  All Locations
                </SelectItem>
                {getFilteredLocations().map((location, index) => (
                  <SelectItem key={index} value={location} className="text-gray-900">
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manual Location Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Or Search Anything</label>
            <Input
              id="search-anything-input"
              placeholder="Enter anything related to properties to search…"
              value={filters.manualLocation || ''}
              onChange={(e) => handleInputChange('manualLocation', e.target.value)}
              className="w-full h-12 bg-gray-50/80 border border-gray-300 rounded-xl hover:bg-gray-100/80 backdrop-blur-sm"
            />
          </div>
          
          {/* Property Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Property Type</label>
            <Select 
              value={filters.propertyType || 'all-types'} 
              onValueChange={(value) => handleInputChange('propertyType', value)}
              disabled={loading}
            >
              <SelectTrigger className="w-full h-12 bg-gray-50/80 border border-gray-300 rounded-xl hover:bg-gray-100/80 disabled:opacity-50 backdrop-blur-sm">
                <SelectValue placeholder={filteredPropertyTypes.length > 0 ? "Select Type" : "No types available"} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] max-h-60">
                <SelectItem value="all-types" className="text-gray-600">All Types</SelectItem>
                {filteredPropertyTypes.map((type, index) => (
                  <SelectItem key={index} value={type} className="text-gray-900">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
            <Select 
              value={filters.category || 'all-categories'} 
              onValueChange={(value) => handleInputChange('category', value)}
              disabled={loading}
            >
              <SelectTrigger className="w-full h-12 bg-gray-50/80 border border-gray-300 rounded-xl hover:bg-gray-100/80 disabled:opacity-50 backdrop-blur-sm">
                <SelectValue placeholder={locationData.categories.length > 0 ? "Select Category" : "No categories available"} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] max-h-60">
                <SelectItem value="all-categories" className="text-gray-600">All Categories</SelectItem>
                {locationData.categories.map((category, index) => (
                  <SelectItem key={index} value={category} className="text-gray-900">{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div>
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 hover:scale-105 transform"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Properties
            </Button>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-4">
          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Location</label>
            <Select 
              value={filters.location || 'all-locations'} 
              onValueChange={(value) => handleInputChange('location', value)}
              disabled={loading}
            >
              <SelectTrigger className="w-full h-12 bg-gray-50/80 border border-gray-300 rounded-xl hover:bg-gray-100/80 disabled:opacity-50 backdrop-blur-sm">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] max-h-60">
                <SelectItem value="all-locations" className="text-gray-600">
                  All Locations
                </SelectItem>
                {getFilteredLocations().map((location, index) => (
                  <SelectItem key={index} value={location} className="text-gray-900">
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manual Location Input - Mobile Only */}
          <div className="block">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Or Search Anything</label>
            <Input
              id="search-anything-input-mobile"
              placeholder="Enter anything related to properties to search…"
              value={filters.manualLocation || ''}
              onChange={(e) => handleInputChange('manualLocation', e.target.value)}
              className="w-full h-12 bg-gray-50/80 border border-gray-300 rounded-xl hover:bg-gray-100/80 backdrop-blur-sm"
            />
          </div>

          {/* Property Type and Category in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Property Type</label>
              <Select 
                value={filters.propertyType || 'all-types'} 
                onValueChange={(value) => handleInputChange('propertyType', value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full h-12 bg-gray-50/80 border border-gray-300 rounded-xl hover:bg-gray-100/80 disabled:opacity-50 backdrop-blur-sm">
                  <SelectValue placeholder={filteredPropertyTypes.length > 0 ? "Select Type" : "No types available"} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] max-h-60">
                  <SelectItem value="all-types" className="text-gray-600">All Types</SelectItem>
                  {filteredPropertyTypes.map((type, index) => (
                    <SelectItem key={index} value={type} className="text-gray-900">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
              <Select 
                value={filters.category || 'all-categories'} 
                onValueChange={(value) => handleInputChange('category', value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full h-12 bg-gray-50/80 border border-gray-300 rounded-xl hover:bg-gray-100/80 disabled:opacity-50 backdrop-blur-sm">
                  <SelectValue placeholder={locationData.categories.length > 0 ? "Select Category" : "No categories available"} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] max-h-60">
                  <SelectItem value="all-categories" className="text-gray-600">All Categories</SelectItem>
                  {locationData.categories.map((category, index) => (
                    <SelectItem key={index} value={category} className="text-gray-900">{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* PG Hostels Subcategory */}
          {filters.category === 'PG/Hostels' && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Hostel Type</label>
              <Select 
                value={filters.subCategory || 'all-hostel-types'} 
                onValueChange={(value) => handleInputChange('subCategory', value)}
              >
                <SelectTrigger className="w-full h-12 bg-gray-50/80 border border-gray-300 rounded-xl hover:bg-gray-100/80 backdrop-blur-sm">
                  <SelectValue placeholder="Select Hostel Type" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] max-h-60">
                  <SelectItem value="all-hostel-types" className="text-gray-600">All Hostel Types</SelectItem>
                  <SelectItem value="Boys" className="text-gray-900">Boys</SelectItem>
                  <SelectItem value="Girls" className="text-gray-900">Girls</SelectItem>
                  <SelectItem value="Co-Living" className="text-gray-900">Co-Living</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            onClick={handleSearch}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 hover:scale-105 transform"
          >
            <Search className="w-5 h-5 mr-2" />
            Search Properties
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;

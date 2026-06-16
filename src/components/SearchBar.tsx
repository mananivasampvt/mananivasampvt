
import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { usePropertyLocations } from '@/hooks/usePropertyLocations';
import { useLocation } from '@/contexts/LocationContext';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  categoryFilter?: string; // Add category context for location filtering
}

export interface SearchFilters {
  location: string;
  area?: string;
  propertyType: string;
  category: string;
  subCategory?: string;
  manualLocation?: string;
  minPrice?: number;
  maxPrice?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, categoryFilter }) => {
  const [searchType, setSearchType] = useState<'buy' | 'rent'>('buy');
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    area: '',
    propertyType: '',
    category: '',
    subCategory: '',
    manualLocation: '',
    minPrice: undefined,
    maxPrice: undefined
  });

  const { locationData, loading, error, refetch } = usePropertyLocations();
  const { userLocation, isLocationSet } = useLocation();

  // Auto-fill location when user location is detected
  useEffect(() => {
    if (userLocation && isLocationSet) {
      setFilters(prev => ({
        ...prev,
        location: userLocation,
        area: '', // Reset area when location changes
        manualLocation: userLocation
      }));
    }
  }, [userLocation, isLocationSet]);

  // Filter property types to exclude Boys/Girls from main dropdown
  const filteredPropertyTypes = locationData.propertyTypes.filter(
    type => !['Boys', 'Girls'].includes(type)
  );

  // Get locations based on category context
  const getFilteredLocations = () => {
    if (!categoryFilter) {
      return locationData.cities; // Use cities instead of locations
    }
    // For now, return all cities but this could be enhanced with backend filtering
    return locationData.cities;
  };

  // Get areas for selected city
  const getAreasForCity = (city: string) => {
    if (!city || !locationData.areas[city]) {
      return [];
    }
    return locationData.areas[city];
  };

  // Get all areas from all cities
  const getAllAreas = () => {
    const allAreas: string[] = [];
    Object.values(locationData.areas).forEach(cityAreas => {
      allAreas.push(...cityAreas);
    });
    return [...new Set(allAreas)].sort(); // Remove duplicates and sort
  };

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    console.log(`Updating ${field} to:`, value);
    const filterValue = value === 'all-locations' || value === 'all-types' || value === 'all-categories' || value === 'all-areas' || value === 'all-hostel-types' ? '' : value;
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [field]: filterValue
      };
      
      // Reset area when location changes
      if (field === 'location') {
        newFilters.area = '';
      }
      
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
      location: filters.manualLocation?.trim() || filters.location,
      // Ensure area is included in search
      area: filters.area || ''
    };
    console.log('Search filters:', searchFilters);
    onSearch(searchFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      location: '',
      area: '',
      propertyType: '',
      category: '',
      subCategory: '',
      manualLocation: '',
      minPrice: undefined,
      maxPrice: undefined
    });
    // Trigger search with empty filters to show all properties
    onSearch({
      location: '',
      area: '',
      propertyType: '',
      category: '',
      subCategory: '',
      manualLocation: '',
      minPrice: undefined,
      maxPrice: undefined
    });
  };

  return (
    <div className="w-full">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50/95 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-full mb-4 text-sm flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <Button
            onClick={refetch}
            size="sm"
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-100 h-8 rounded-lg"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:block w-full max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/40 p-6 lg:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-transparent rounded-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="space-y-4">
              {/* Row 1: Location and Area */}
              <div className="grid grid-cols-2 gap-4">
                {/* Location Select */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">City/Location</label>
                  <Select 
                    value={filters.location || 'all-locations'} 
                    onValueChange={(value) => handleInputChange('location', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full h-14 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 disabled:opacity-50 backdrop-blur-sm text-slate-700">
                      <div className="flex items-center">
                        {isLocationSet && filters.location === userLocation && (
                          <MapPin className="w-4 h-4 text-emerald-600 mr-2" />
                        )}
                        <SelectValue placeholder="Select City" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 rounded-full shadow-xl z-[200] max-h-60">
                      <SelectItem value="all-locations" className="text-slate-600">
                        All Cities
                      </SelectItem>
                      {getFilteredLocations().map((location, index) => (
                        <SelectItem key={index} value={location} className="text-slate-900">
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Area Select */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Area</label>
                  <Select 
                    value={filters.area || 'all-areas'} 
                    onValueChange={(value) => handleInputChange('area', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full h-14 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 disabled:opacity-50 backdrop-blur-sm">
                      <SelectValue placeholder="Select Area" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 rounded-full shadow-2xl z-[200] max-h-60">
                      <SelectItem value="all-areas" className="text-gray-600">
                        All Areas
                      </SelectItem>
                      {filters.location && filters.location !== 'all-locations' ? (
                        getAreasForCity(filters.location).map((area, index) => (
                          <SelectItem key={index} value={area} className="text-slate-900">
                            {area}
                          </SelectItem>
                        ))
                      ) : (
                        getAllAreas().map((area, index) => (
                          <SelectItem key={index} value={area} className="text-slate-900">
                            {area}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Property Type and Category */}
              <div className="grid grid-cols-2 gap-4">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Property Type</label>
                  <Select 
                    value={filters.propertyType || 'all-types'} 
                    onValueChange={(value) => handleInputChange('propertyType', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full h-14 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 disabled:opacity-50 backdrop-blur-sm">
                      <SelectValue placeholder={filteredPropertyTypes.length > 0 ? "Select Type" : "No types available"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 rounded-full shadow-2xl z-[200] max-h-60">
                      <SelectItem value="all-types" className="text-gray-600">All Types</SelectItem>
                      {filteredPropertyTypes.map((type, index) => (
                        <SelectItem key={index} value={type} className="text-slate-900">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Category</label>
                  <Select 
                    value={filters.category || 'all-categories'} 
                    onValueChange={(value) => handleInputChange('category', value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full h-14 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 disabled:opacity-50 backdrop-blur-sm">
                      <SelectValue placeholder={locationData.categories.length > 0 ? "Select Category" : "No categories available"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 rounded-full shadow-2xl z-[200] max-h-60">
                      <SelectItem value="all-categories" className="text-gray-600">All Categories</SelectItem>
                      {locationData.categories.map((category, index) => (
                        <SelectItem key={index} value={category} className="text-slate-900">{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Manual Search Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Or Search Anything</label>
                <Input
                  id="search-anything-input"
                  placeholder="Enter anything related to properties to search…"
                  value={filters.manualLocation || ''}
                  onChange={(e) => handleInputChange('manualLocation', e.target.value)}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 backdrop-blur-sm"
                />
              </div>

              {/* Row 4: Action Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex-1 h-14 bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 hover:scale-105 transform"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Properties
                </Button>
                <Button 
                  onClick={handleClearFilters}
                  variant="outline"
                  className="h-14 px-6 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-full font-medium transition-all duration-200 bg-white"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-6">
          {/* Buy/Rent Tabs */}
          <div className="flex gap-6 mb-6 border-b border-gray-200 pb-4">
            <button
              onClick={() => setSearchType('buy')}
              className={`text-lg font-medium pb-2 transition-colors ${
                searchType === 'buy'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setSearchType('rent')}
              className={`text-lg font-medium pb-2 transition-colors ${
                searchType === 'rent'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Rent
            </button>
          </div>

          {/* Form Content */}
          <div className="space-y-5">
            {/* I'm looking to ... */}
            <div>
              <p className="text-gray-600 text-sm mb-3">I'm looking to {searchType === 'rent' ? 'rent' : 'buy'}</p>
              <Select
                value={filters.propertyType || 'all-types'}
                onValueChange={(value) => handleInputChange('propertyType', value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 text-gray-700 flex items-center">
                  <SelectValue placeholder="Apartments" />
                  <span className="ml-auto text-gray-400">▼</span>
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 rounded-full shadow-lg z-[200] max-h-60">
                  <SelectItem value="all-types" className="text-gray-600">All Types</SelectItem>
                  {filteredPropertyTypes.map((type, index) => (
                    <SelectItem key={index} value={type} className="text-slate-900">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City and Area Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* In the city of ... */}
              <div>
                <p className="text-gray-600 text-sm mb-3">In the city of</p>
                <Select
                  value={filters.location || 'all-locations'}
                  onValueChange={(value) => handleInputChange('location', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 text-gray-700 flex items-center">
                    <div className="flex items-center w-full">
                      {isLocationSet && filters.location === userLocation && (
                        <MapPin className="w-4 h-4 text-emerald-600 mr-2" />
                      )}
                      <SelectValue placeholder="Location" />
                    </div>
                    <span className="ml-auto text-gray-400">▼</span>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-full shadow-lg z-[200] max-h-60">
                    <SelectItem value="all-locations" className="text-slate-600">
                      All Cities
                    </SelectItem>
                    {getFilteredLocations().map((location, index) => (
                      <SelectItem key={index} value={location} className="text-slate-900">
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Area */}
              <div>
                <p className="text-gray-600 text-sm mb-3">Area</p>
                <Select
                  value={filters.area || 'all-areas'}
                  onValueChange={(value) => handleInputChange('area', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 text-gray-700 flex items-center">
                    <SelectValue placeholder="Area" />
                    <span className="ml-auto text-gray-400">▼</span>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-full shadow-lg z-[200] max-h-60">
                    <SelectItem value="all-areas" className="text-gray-600">
                      All Areas
                    </SelectItem>
                    {filters.location && filters.location !== 'all-locations' ? (
                      getAreasForCity(filters.location).map((area, index) => (
                        <SelectItem key={index} value={area} className="text-slate-900">
                          {area}
                        </SelectItem>
                      ))
                    ) : (
                      getAllAreas().map((area, index) => (
                        <SelectItem key={index} value={area} className="text-slate-900">
                          {area}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Property Type and Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <p className="text-gray-600 text-sm mb-3">Category</p>
                <Select
                  value={filters.category || 'all-categories'}
                  onValueChange={(value) => handleInputChange('category', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 text-gray-700 flex items-center">
                    <SelectValue placeholder="Category" />
                    <span className="ml-auto text-gray-400">▼</span>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300 rounded-full shadow-lg z-[200] max-h-60">
                    <SelectItem value="all-categories" className="text-gray-600">All Categories</SelectItem>
                    {locationData.categories.map((category, index) => (
                      <SelectItem key={index} value={category} className="text-slate-900">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* PG Hostels Subcategory - shown only when PG/Hostels selected */}
              {filters.category === 'PG/Hostels' && (
                <div>
                  <p className="text-gray-600 text-sm mb-3">Hostel Type</p>
                  <Select
                    value={filters.subCategory || 'all-hostel-types'}
                    onValueChange={(value) => handleInputChange('subCategory', value)}
                  >
                    <SelectTrigger className="w-full h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 text-gray-700 flex items-center">
                      <SelectValue placeholder="Hostel Type" />
                      <span className="ml-auto text-gray-400">▼</span>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300 rounded-full shadow-lg z-[200] max-h-60">
                      <SelectItem value="all-hostel-types" className="text-gray-600">All Hostel Types</SelectItem>
                      <SelectItem value="Boys" className="text-slate-900">Boys</SelectItem>
                      <SelectItem value="Girls" className="text-slate-900">Girls</SelectItem>
                      <SelectItem value="Co-Living" className="text-slate-900">Co-Living</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Or Search Anything */}
            <div>
              <p className="text-gray-600 text-sm mb-3">Or Search Anything</p>
              <Input
                id="search-anything-input-mobile"
                placeholder="Enter anything related to properties to search…"
                value={filters.manualLocation || ''}
                onChange={(e) => handleInputChange('manualLocation', e.target.value)}
                className="w-full h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-50 text-gray-700"
              />
            </div>

            {/* In price range of ... */}
            <div>
              <p className="text-gray-600 text-sm mb-3">In price range of</p>
              <div className="flex gap-3 items-center">
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="flex-1 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-50 text-gray-700"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="flex-1 h-12 bg-white border border-gray-300 rounded-full hover:bg-gray-50 text-gray-700"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
              <Button 
                onClick={handleClearFilters}
                variant="outline"
                className="h-12 px-6 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full font-medium transition-all duration-200 bg-white"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;

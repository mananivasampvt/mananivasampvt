
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AdminPropertyFiltersProps {
  onDateChange: (date: Date | undefined) => void;
  onCategoryChange: (category: string) => void;
  onClear: () => void;
  selectedDate?: Date;
  selectedCategory: string;
  totalCount: number;
  filteredCount: number;
}

const AdminPropertyFilters: React.FC<AdminPropertyFiltersProps> = ({
  onDateChange,
  onCategoryChange,
  onClear,
  selectedDate,
  selectedCategory,
  totalCount,
  filteredCount
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'sell', label: 'For Sale' },
    { value: 'rent', label: 'For Rent' },
    { value: 'land', label: 'Land' },
    { value: 'pg', label: 'PG Hostels' },
    { value: 'pg-boys', label: 'PG - Boys', parent: 'pg' },
    { value: 'pg-girls', label: 'PG - Girls', parent: 'pg' },
    { value: 'pg-coliving', label: 'PG - Co-Living', parent: 'pg' }
  ];

  const hasActiveFilters = selectedDate || selectedCategory !== 'all';

  return (
    <Card className="bg-white/80 backdrop-blur-lg border border-white/30 shadow-lg mb-6">
      <CardContent className="p-4 sm:p-6">
        {/* Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Property Filters</h3>
              <p className="text-sm text-gray-600">
                Showing {filteredCount} of {totalCount} properties
              </p>
            </div>
          </div>
          
          {hasActiveFilters && (
            <Button
              onClick={onClear}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Filter by Date Added</label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd-MM-yyyy") : "Select Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-lg border border-white/30" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    onDateChange(date);
                    setIsDatePickerOpen(false);
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Filter by Category</label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
                <SelectValue placeholder="Choose Category" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-lg border border-white/30">
                {categoryOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className={cn(
                      "transition-colors duration-200",
                      option.parent ? "pl-6 text-sm" : "",
                      selectedCategory === option.value ? "bg-blue-50 text-blue-700 font-medium" : ""
                    )}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200/50">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Date: {format(selectedDate, "dd-MM-yyyy")}
                  <button
                    onClick={() => onDateChange(undefined)}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {categoryOptions.find(opt => opt.value === selectedCategory)?.label}
                  <button
                    onClick={() => onCategoryChange('all')}
                    className="ml-1 hover:text-purple-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPropertyFilters;

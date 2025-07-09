
import React from 'react';
import { Building, Users, Image as ImageIcon, BarChart3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  propertyCounts: {
    all: number;
    sell: number;
    rent: number;
    land: number;
    pg: number;
  };
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  propertyCounts,
}) => {
  const sidebarItems = [
    {
      id: 'properties',
      label: 'Properties',
      icon: Building,
      hasDropdown: true,
    },
    {
      id: 'team',
      label: 'Team Members',
      icon: Users,
      hasDropdown: false,
    },
    {
      id: 'story',
      label: 'Story Images',
      icon: ImageIcon,
      hasDropdown: false,
    },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All', count: propertyCounts.all },
    { value: 'sell', label: 'Sell', count: propertyCounts.sell },
    { value: 'rent', label: 'Rent', count: propertyCounts.rent },
    { value: 'land', label: 'Land', count: propertyCounts.land },
    { value: 'pg', label: 'PG Hostels', count: propertyCounts.pg },
  ];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setActiveTab('properties');
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-lg border-r border-white/20 shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Admin Panel
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <div key={item.id}>
              {item.hasDropdown ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className={`w-full justify-start text-left transition-all duration-200 ${
                        activeTab === item.id 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                          : 'hover:bg-white/60 text-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                      <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">
                        {propertyCounts.all}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    side="right" 
                    className="w-56 bg-white/95 backdrop-blur-lg border border-white/20 shadow-xl"
                  >
                    {categoryOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleCategorySelect(option.value)}
                        className={`cursor-pointer transition-colors ${
                          selectedCategory === option.value 
                            ? 'bg-purple-50 text-purple-600 font-medium' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex-1">{option.label}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full ml-2">
                          {option.count}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant={activeTab === item.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full justify-start transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                      : 'hover:bg-white/60 text-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              )}
            </div>
          ))}
        </nav>

        {/* Active Filter Display */}
        {activeTab === 'properties' && selectedCategory !== 'all' && (
          <div className="mx-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Active Filter:</span> {capitalizeFirst(selectedCategory === 'pg' ? 'PG Hostels' : selectedCategory)}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminSidebar;

import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, Edit, Trash2, Building, Home, Users, MapPin, Image as ImageIcon, Mail, BarChart3, Calendar, Settings, Menu, ChevronDown } from 'lucide-react';
import AdminPropertyForm from '@/components/AdminPropertyForm';
import TeamMemberForm from '@/components/TeamMemberForm';
import StoryImageForm from '@/components/StoryImageForm';
import AdminSidebar from '@/components/AdminSidebar';
import AdminPropertyFilters from '@/components/AdminPropertyFilters';
import { format, isValid, parseISO, startOfDay, endOfDay } from 'date-fns';

interface AdminProperty {
  id: string;
  title: string;
  price: string;  
  location: string;
  type: string;
  category: string;
  images: string[];
  area: string;
  description: string;
  featured?: boolean;
  createdAt?: any;
  subCategory: string;
  city: string;
  bhk: string;
  furnishing: string;
  floor: string;
  totalFloors: string;
  availableFrom: string;
  amenities: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  createdAt?: any;
}

interface StoryImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
}

const AdminDashboard = () => {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [storyImages, setStoryImages] = useState<StoryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // New filter states
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showStoryImageForm, setShowStoryImageForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<AdminProperty | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [editingStoryImage, setEditingStoryImage] = useState<StoryImage | null>(null);
  const [activeTab, setActiveTab] = useState('properties');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [propertiesDropdownOpen, setPropertiesDropdownOpen] = useState(false);
  const { logout, currentUser, isAdmin, userRole } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
    fetchTeamMembers();
    fetchStoryImages();
  }, []);

  const fetchProperties = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'properties'));
      const propertiesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          subCategory: data.subCategory || data.category || '',
          city: data.city || data.location?.split(',')[1]?.trim() || 'Unknown',
          bhk: data.bhk || 'N/A',
          furnishing: data.furnishing || 'Not Specified',
          floor: data.floor || 'Ground Floor',
          totalFloors: data.totalFloors || 'N/A',
          availableFrom: data.availableFrom || 'Immediate',
          amenities: data.amenities || [],
          contactName: data.contactName || 'Not Provided',
          contactPhone: data.contactPhone || 'Not Provided',
          contactEmail: data.contactEmail || 'Not Provided'
        };
      }) as AdminProperty[];
      
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'teamMembers'));
      const teamData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeamMember[];
      
      setTeamMembers(teamData);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      });
    }
  };

  const fetchStoryImages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'storyImages'));
      const imageData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoryImage[];
      
      setStoryImages(imageData);
    } catch (error) {
      console.error('Error fetching story images:', error);
      toast({
        title: "Error",
        description: "Failed to fetch story images",
        variant: "destructive",
      });
    }
  };

  const getValidImage = (property: AdminProperty) => {
    const defaultImage = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=200';
    
    if (!property.images || !Array.isArray(property.images) || property.images.length === 0) {
      return defaultImage;
    }
    
    const validImages = property.images.filter(img => {
      return img && typeof img === 'string' && !img.startsWith('blob:') && 
             (img.startsWith('data:image/') || img.startsWith('https://'));
    });
    
    return validImages.length > 0 ? validImages[0] : defaultImage;
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteDoc(doc(db, 'properties', propertyId));
        setProperties(properties.filter(p => p.id !== propertyId));
        toast({
          title: "Success",
          description: "Property deleted successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to delete property",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteTeamMember = async (memberId: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await deleteDoc(doc(db, 'teamMembers', memberId));
        setTeamMembers(teamMembers.filter(m => m.id !== memberId));
        toast({
          title: "Success",
          description: "Team member deleted successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to delete team member",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteStoryImage = async (imageId: string) => {
    if (window.confirm('Are you sure you want to delete this story image?')) {
      try {
        await deleteDoc(doc(db, 'storyImages', imageId));
        setStoryImages(storyImages.filter(img => img.id !== imageId));
        toast({
          title: "Success",
          description: "Story image deleted successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to delete story image",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditProperty = (property: AdminProperty) => {
    setEditingProperty(property);
    setShowPropertyForm(true);
  };

  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member);
    setShowTeamForm(true);
  };

  const handleEditStoryImage = (image: StoryImage) => {
    setEditingStoryImage(image);
    setShowStoryImageForm(true);
  };

  const handleClosePropertyForm = () => {
    setShowPropertyForm(false);
    setEditingProperty(null);
  };

  const handleCloseTeamForm = () => {
    setShowTeamForm(false);
    setEditingTeamMember(null);
  };

  const handleCloseStoryImageForm = () => {
    setShowStoryImageForm(false);
    setEditingStoryImage(null);
  };

  const handlePropertyFormSuccess = () => {
    fetchProperties();
    handleClosePropertyForm();
  };

  const handleTeamFormSuccess = () => {
    fetchTeamMembers();
    handleCloseTeamForm();
  };

  const handleStoryImageFormSuccess = () => {
    fetchStoryImages();
    handleCloseStoryImageForm();
  };

  const handleEmailContact = () => {
    const subject = encodeURIComponent('Inquiry from Admin Panel');
    const body = encodeURIComponent("Hello, I'd like to get in touch regarding the real estate dashboard.");
    window.location.href = `mailto:snsnarayanac@gmail.com?subject=${subject}&body=${body}`;
  };

  // Enhanced filtering logic with date and category filters
  const filteredProperties = useMemo(() => {
    let filtered = properties;

    // Apply date filter
    if (filterDate) {
      filtered = filtered.filter(property => {
        if (!property.createdAt) return false;
        
        let propertyDate: Date;
        
        // Handle different date formats from Firestore
        if (property.createdAt?.toDate) {
          // Firestore Timestamp
          propertyDate = property.createdAt.toDate();
        } else if (property.createdAt?.seconds) {
          // Firestore Timestamp object
          propertyDate = new Date(property.createdAt.seconds * 1000);
        } else if (typeof property.createdAt === 'string') {
          // String date
          propertyDate = parseISO(property.createdAt);
        } else if (property.createdAt instanceof Date) {
          // Already a Date object
          propertyDate = property.createdAt;
        } else {
          return false;
        }

        if (!isValid(propertyDate)) return false;

        // Compare dates (same day)
        const filterStart = startOfDay(filterDate);
        const filterEnd = endOfDay(filterDate);
        const propTime = propertyDate.getTime();
        
        return propTime >= filterStart.getTime() && propTime <= filterEnd.getTime();
      });
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(property => {
        const category = property.category?.toLowerCase() || '';
        const subCategory = property.subCategory?.toLowerCase() || '';
        const type = property.type?.toLowerCase() || '';
        
        switch (filterCategory) {
          case 'sell':
            return category.includes('sale') || category === 'for sale';
          case 'rent':
            return category.includes('rent') && !category.includes('pg');
          case 'land':
            return category.includes('land') || type.includes('land') || type.includes('plot');
          case 'pg':
            return category.includes('pg') || category === 'pg/hostels' || type.includes('pg');
          case 'pg-boys':
            return (category.includes('pg') || category === 'pg/hostels') && 
                   (subCategory.includes('boys') || subCategory.includes('male'));
          case 'pg-girls':
            return (category.includes('pg') || category === 'pg/hostels') && 
                   (subCategory.includes('girls') || subCategory.includes('female'));
          case 'pg-coliving':
            return (category.includes('pg') || category === 'pg/hostels') && 
                   (subCategory.includes('coliving') || subCategory.includes('co-living'));
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [properties, filterDate, filterCategory]);

  // Update the getFilteredProperties function to use the new filtered results
  const getFilteredProperties = () => {
    if (selectedCategory === 'all') return filteredProperties;
    
    return filteredProperties.filter(property => {
      switch (selectedCategory) {
        case 'sell':
          return property.category.toLowerCase().includes('sale');
        case 'rent':
          return property.category.toLowerCase().includes('rent') && !property.category.toLowerCase().includes('pg');
        case 'land':
          return property.category.toLowerCase().includes('land');
        case 'pg':
          return property.category.toLowerCase().includes('pg');
        default:
          return true;
      }
    });
  };

  const finalFilteredProperties = getFilteredProperties();

  // Calculate property counts for sidebar (using original properties, not filtered)
  const propertyCounts = {
    all: properties.length,
    sell: properties.filter(p => p.category.toLowerCase().includes('sale')).length,
    rent: properties.filter(p => p.category.toLowerCase().includes('rent') && !p.category.toLowerCase().includes('pg')).length,
    land: properties.filter(p => p.category.toLowerCase().includes('land')).length,
    pg: properties.filter(p => p.category.toLowerCase().includes('pg')).length,
  };

  const stats = [
    {
      title: 'Total Properties',
      value: properties.length,
      icon: Building,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-gradient-to-r from-blue-50 to-purple-50',
      iconBg: 'bg-gradient-to-r from-blue-500 to-purple-600'
    },
    {
      title: 'For Sale',
      value: propertyCounts.sell,
      icon: Home,
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-gradient-to-r from-green-50 to-teal-50',
      iconBg: 'bg-gradient-to-r from-green-500 to-teal-600'
    },
    {
      title: 'For Rent',
      value: propertyCounts.rent,
      icon: MapPin,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-gradient-to-r from-orange-50 to-red-50',
      iconBg: 'bg-gradient-to-r from-orange-500 to-red-600'
    },
    {
      title: 'Land/PG',
      value: propertyCounts.land + propertyCounts.pg,
      icon: Users,
      color: 'from-pink-500 to-purple-600',
      bgColor: 'bg-gradient-to-r from-pink-50 to-purple-50',
      iconBg: 'bg-gradient-to-r from-pink-500 to-purple-600'
    }
  ];

  const handleMobileNavClick = (section: string) => {
    setActiveTab(section);
    setMobileMenuOpen(false);
    setPropertiesDropdownOpen(false);
  };

  const handlePropertiesDropdown = () => {
    setPropertiesDropdownOpen(!propertiesDropdownOpen);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setActiveTab('properties');
    setPropertiesDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // Filter handlers
  const handleDateFilterChange = (date: Date | undefined) => {
    setFilterDate(date);
  };

  const handleCategoryFilterChange = (category: string) => {
    setFilterCategory(category);
  };

  const handleClearFilters = () => {
    setFilterDate(undefined);
    setFilterCategory('all');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-x-hidden">
      {/* Background Images with Soft Transitions */}
      <div className="absolute inset-0 opacity-5 bg-[url('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=1926')] bg-cover bg-center bg-no-repeat transition-opacity duration-1000"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/60 to-purple-50/80"></div>
      
      {/* Mobile Header - scrolls with page */}
      <div className="block md:hidden relative z-30">
        <header className="bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000')] bg-cover bg-center px-4 py-3 border-b border-white/20 shadow-lg backdrop-blur-sm bg-black/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <BarChart3 className="w-3 h-3 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white drop-shadow-lg">
                  Mana Nivasam
                </h1>
                <p className="text-xs text-white/90 drop-shadow">
                  Welcome back, {currentUser?.email?.split('@')[0]} ({userRole === 'admin' ? 'Admin' : 'User'})
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:bg-white/20"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => {
                setMobileMenuOpen(false);
                setPropertiesDropdownOpen(false);
              }}
            />
            <div className="fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-white/20 shadow-xl z-50 max-h-80 overflow-y-auto">
              <div className="p-4 space-y-2">
                {/* Properties Dropdown */}
                <div>
                  <Button
                    variant="ghost"
                    onClick={handlePropertiesDropdown}
                    className="w-full justify-between text-left hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-3" />
                      Properties ({propertyCounts.all})
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${propertiesDropdownOpen ? 'rotate-180' : ''}`} />
                  </Button>
                  {propertiesDropdownOpen && (
                    <div className="ml-6 mt-2 space-y-1">
                      {[
                        { value: 'all', label: 'All', count: propertyCounts.all },
                        { value: 'sell', label: 'For Sale', count: propertyCounts.sell },
                        { value: 'rent', label: 'For Rent', count: propertyCounts.rent },
                        { value: 'land', label: 'Land', count: propertyCounts.land },
                        { value: 'pg', label: 'PG Hostels', count: propertyCounts.pg },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant="ghost"
                          onClick={() => handleCategorySelect(option.value)}
                          className={`w-full justify-start ${
                            selectedCategory === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'
                          }`}
                        >
                          {option.label} ({option.count})
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Other Menu Items */}
                <Button
                  variant="ghost"
                  onClick={() => handleMobileNavClick('team')}
                  className={`w-full justify-start hover:bg-blue-50 ${activeTab === 'team' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                >
                  <Users className="w-4 h-4 mr-3" />
                  Team Members
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => handleMobileNavClick('story')}
                  className={`w-full justify-start hover:bg-blue-50 ${activeTab === 'story' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                >
                  <ImageIcon className="w-4 h-4 mr-3" />
                  Story Images
                </Button>

                {/* Logout Button in Mobile Menu */}
                <div className="pt-2 border-t border-gray-200">
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop Sidebar and Layout */}
      <div className="relative z-10 flex min-h-screen w-full">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AdminSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            propertyCounts={propertyCounts}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0 w-full min-w-0">
          {/* Desktop Header - hidden on mobile */}
          <header className="hidden md:block sticky top-0 z-30 backdrop-blur-lg bg-white/80 border-b border-white/20 shadow-lg">
            <div className="px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Prime Vista Dashboard
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Welcome back, {currentUser?.email?.split('@')[0]} 
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {userRole === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {activeTab === 'properties' && (
                    <Button 
                      onClick={() => setShowPropertyForm(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl text-sm px-4 py-2 rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Property
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:border-red-300 hover:text-red-600 text-sm px-4 py-2 rounded-xl border-2"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Add Property Button - Only show in Properties section */}
          {activeTab === 'properties' && (
            <div className="block md:hidden p-4 pb-2">
              <Button 
                onClick={() => setShowPropertyForm(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl text-sm py-3 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </div>
          )}

          <div className="p-4 sm:p-6 space-y-8 w-full">
            {activeTab === 'properties' && (
              <>
                {/* Stats Grid - Mobile: 2x2 grid, Desktop: 1x4 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 w-full">
                  {stats.map((stat, index) => (
                    <Card 
                      key={index} 
                      className={`${stat.bgColor} border-0 transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-2xl animate-in fade-in-up backdrop-blur-sm bg-white/60 w-full`}
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      <CardContent className="p-3 md:p-6">
                        <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:text-left gap-2 md:gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-700 mb-1 md:mb-2 truncate">{stat.title}</p>
                            <p className="text-xl md:text-4xl font-bold text-gray-900">{stat.value}</p>
                          </div>
                          <div className={`w-8 h-8 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-xl transition-transform duration-300 hover:scale-110 hover:rotate-6 flex-shrink-0`}>
                            <stat.icon className="w-4 h-4 md:w-8 md:h-8 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Property Filters */}
                <AdminPropertyFilters
                  onDateChange={handleDateFilterChange}
                  onCategoryChange={handleCategoryFilterChange}
                  onClear={handleClearFilters}
                  selectedDate={filterDate}
                  selectedCategory={filterCategory}
                  totalCount={properties.length}
                  filteredCount={finalFilteredProperties.length}
                />

                {/* Properties List */}
                <Card className="bg-white/60 backdrop-blur-lg border border-white/30 shadow-xl w-full">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {selectedCategory === 'all' ? 'All Properties' : 
                       selectedCategory === 'pg' ? 'PG Hostels' :
                       `Properties for ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`} ({finalFilteredProperties.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse flex space-x-4 p-4 bg-white/40 rounded-2xl">
                            <div className="h-12 w-12 md:h-16 md:w-16 bg-gray-300 rounded-xl flex-shrink-0"></div>
                            <div className="flex-1 space-y-2 min-w-0">
                              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : finalFilteredProperties.length > 0 ? (
                      <div className="space-y-3">
                        {finalFilteredProperties.map((property, index) => (
                          <div 
                            key={property.id} 
                            className="flex items-center space-x-3 p-3 md:p-4 bg-white/70 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 transition-all duration-300 ease-in-out hover:bg-white/90 hover:shadow-xl transform hover:scale-[1.02] animate-in fade-in-up w-full"
                            style={{animationDelay: `${index * 50}ms`}}
                          >
                            <img 
                              src={getValidImage(property)}
                              alt={property.title}
                              className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg md:rounded-xl shadow-lg transition-transform duration-300 hover:scale-110 flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=200';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">{property.title}</h3>
                              <p className="text-gray-600 text-xs md:text-sm truncate">{property.location}</p>
                              <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1 md:mt-2">
                                <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                  {property.category}
                                </span>
                                <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                                  {property.price}
                                </span>
                                {property.createdAt && (
                                  <span className="text-xs text-gray-500">
                                    {(() => {
                                      try {
                                        let date: Date;
                                        if (property.createdAt?.toDate) {
                                          // Firestore Timestamp
                                          date = property.createdAt.toDate();
                                        } else if (property.createdAt?.seconds) {
                                          // Firestore Timestamp object
                                          date = new Date(property.createdAt.seconds * 1000);
                                        } else if (typeof property.createdAt === 'string') {
                                          // String date
                                          date = parseISO(property.createdAt);
                                        } else if (property.createdAt instanceof Date) {
                                          // Already a Date object
                                          date = property.createdAt;
                                        } else {
                                          return '';
                                        }
                                        return isValid(date) ? format(date, 'dd-MM-yyyy') : '';
                                      } catch {
                                        return '';
                                      }
                                    })()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditProperty(property)}
                                className="p-1 md:p-2 h-8 w-8 md:h-auto md:w-auto transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg rounded-lg md:rounded-xl bg-white/60 backdrop-blur-sm"
                              >
                                <Edit className="w-3 h-3 md:w-4 md:h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteProperty(property.id)}
                                className="p-1 md:p-2 h-8 w-8 md:h-auto md:w-auto text-red-600 hover:text-red-700 transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-red-50 hover:border-red-300 hover:shadow-lg rounded-lg md:rounded-xl bg-white/60 backdrop-blur-sm"
                              >
                                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-6 flex items-center justify-center">
                          <Building className="w-8 h-8 md:w-10 md:h-10 text-gray-500" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">No Properties Found</h3>
                        <p className="text-gray-600 mb-6 text-sm md:text-base">
                          {(filterDate || filterCategory !== 'all') 
                            ? 'No properties match the selected filters. Try adjusting your search criteria.' 
                            : selectedCategory === 'all' 
                              ? 'Start by adding your first property listing.' 
                              : `No properties found in the ${selectedCategory === 'pg' ? 'PG Hostels' : selectedCategory} category.`
                          }
                        </p>
                        {(filterDate || filterCategory !== 'all') ? (
                          <Button 
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl rounded-xl mr-4"
                            onClick={handleClearFilters}
                          >
                            Clear Filters
                          </Button>
                        ) : null}
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl rounded-xl"
                          onClick={() => setShowPropertyForm(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Property
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'team' && (
              <Card className="bg-white/60 backdrop-blur-lg border border-white/30 shadow-xl w-full">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="text-lg md:text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Team Members ({teamMembers.length})
                  </CardTitle>
                  <Button 
                    onClick={() => setShowTeamForm(true)}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl text-sm rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team Member
                  </Button>
                </CardHeader>
                <CardContent>
                  {teamMembers.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                      {teamMembers.map((member, index) => (
                        <div 
                          key={member.id} 
                          className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl p-3 md:p-4 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-in fade-in-up w-full"
                          style={{animationDelay: `${index * 100}ms`}}
                        >
                          <div className="text-center">
                            <img 
                              src={member.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400'}
                              alt={member.name}
                              className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-full mx-auto mb-2 md:mb-3 shadow-xl ring-2 ring-white/50"
                            />
                            <h3 className="font-bold text-gray-900 text-xs md:text-sm truncate mb-1">{member.name}</h3>
                            <p className="text-purple-600 font-medium text-xs mb-1 md:mb-2 truncate">{member.role}</p>
                            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-2 md:mb-3">{member.description}</p>
                            <div className="flex justify-center space-x-1 md:space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditTeamMember(member)}
                                className="p-1 h-6 w-6 md:h-8 md:w-8 transition-all duration-300 hover:scale-110 rounded-lg bg-white/60 backdrop-blur-sm"
                              >
                                <Edit className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteTeamMember(member.id)}
                                className="p-1 h-6 w-6 md:h-8 md:w-8 text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-110 rounded-lg bg-white/60 backdrop-blur-sm"
                              >
                                <Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Users className="w-8 h-8 md:w-10 md:h-10 text-gray-500" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">No Team Members</h3>
                      <p className="text-gray-600 mb-6 text-sm md:text-base">Start by adding your first team member.</p>
                      <Button 
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl rounded-xl"
                        onClick={() => setShowTeamForm(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Team Member
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'story' && (
              <Card className="bg-white/60 backdrop-blur-lg border border-white/30 shadow-xl w-full">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="text-lg md:text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Story Images ({storyImages.length})
                  </CardTitle>
                  <Button 
                    onClick={() => setShowStoryImageForm(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl text-sm rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Story Image
                  </Button>
                </CardHeader>
                <CardContent>
                  {storyImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full">
                      {storyImages.map((image, index) => (
                        <div 
                          key={image.id} 
                          className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-in fade-in-up w-full"
                          style={{animationDelay: `${index * 100}ms`}}
                        >
                          <div className="text-center">
                            <img 
                              src={image.url}
                              alt={image.title || 'Story image'}
                              className="w-full h-24 md:h-40 object-cover rounded-lg md:rounded-xl mb-3 md:mb-4 shadow-lg"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1497604401993-f2e922e5cb0a?q=80&w=400';
                              }}
                            />
                            {image.title && (
                              <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1 md:mb-2 truncate">{image.title}</h3>
                            )}
                            {image.description && (
                              <p className="text-gray-600 text-xs leading-relaxed mb-3 md:mb-4 line-clamp-2">{image.description}</p>
                            )}
                            <div className="flex justify-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditStoryImage(image)}
                                className="p-1 h-7 w-7 md:h-auto md:w-auto transition-all duration-300 hover:scale-110 rounded-lg md:rounded-xl bg-white/60 backdrop-blur-sm"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteStoryImage(image.id)}
                                className="p-1 h-7 w-7 md:h-auto md:w-auto text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-110 rounded-lg md:rounded-xl bg-white/60 backdrop-blur-sm"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-500" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">No Story Images</h3>
                      <p className="text-gray-600 mb-6 text-sm md:text-base">Start by adding your first story image for the About page.</p>
                      <Button 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl rounded-xl"
                        onClick={() => setShowStoryImageForm(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Story Image
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Section - hidden on mobile */}
            <div className="mt-8 hidden md:block w-full">
              <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 text-white border-0 shadow-2xl">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Need Assistance?</h3>
                  <p className="mb-6 text-white/90">Our expert team is here to help you maximize your admin dashboard experience.</p>
                  <Button 
                    onClick={handleEmailContact}
                    className="bg-white text-purple-600 hover:bg-gray-100 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl rounded-xl font-semibold"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPropertyForm && (
        <AdminPropertyForm
          onClose={handleClosePropertyForm}
          onSuccess={handlePropertyFormSuccess}
          property={editingProperty}
        />
      )}

      {showTeamForm && (
        <TeamMemberForm
          onClose={handleCloseTeamForm}
          onSuccess={handleTeamFormSuccess}
          member={editingTeamMember}
        />
      )}

      {showStoryImageForm && (
        <StoryImageForm
          onClose={handleCloseStoryImageForm}
          onSuccess={handleStoryImageFormSuccess}
          image={editingStoryImage}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

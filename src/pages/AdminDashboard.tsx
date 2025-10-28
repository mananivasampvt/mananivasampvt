import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, Edit, Trash2, Building, Home, Users, MapPin, Image as ImageIcon, Mail, BarChart3, Calendar, Settings, Menu, ChevronDown, Eye, Database, X, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminPropertyForm from '@/components/AdminPropertyForm';
import TeamMemberForm from '@/components/TeamMemberForm';
import StoryImageForm from '@/components/StoryImageForm';
import AdminSidebar from '@/components/AdminSidebar';
import AdminPropertyFilters from '@/components/AdminPropertyFilters';
import { format, isValid, parseISO, startOfDay, endOfDay } from 'date-fns';
import { VisitorStatsCard } from '@/components/VisitorStatsCard';
import { VisitorDataMigrationPanel } from '@/components/VisitorDataMigrationPanel';
import UserManagementPanel from '@/components/UserManagementPanel';
import UserAnalyticsDashboard from '@/components/UserAnalyticsDashboard';
import RealtimeUserSignups from '@/components/RealtimeUserSignups';
import UserSettingsPanel from '@/components/UserSettingsPanel';
import SimpleUserDashboard from '@/components/SimpleUserDashboard';
import FirebaseAuthUserManagement from '@/components/FirebaseAuthUserManagement';
import FirebaseAuthDashboard from '@/components/FirebaseAuthDashboard';
import FirebaseAuthSummary from '@/components/FirebaseAuthSummary';
import { useRealtimeUsers } from '@/hooks/useRealtimeUsers';

interface AdminProperty {
  id: string;
  title: string;
  price: string;  
  location: string;
  type: string;
  category: string;
  images: string[];
  area: string;
  areaAcres?: number;
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
  propertyAge?: number;
  status?: string;
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

interface UserListing {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  category: string;
  images: string[];
  area: string;
  description: string;
  submittedBy: string;
  submittedByEmail: string;
  submittedAt: any;
  approved: boolean;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
}

const AdminDashboard = () => {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [storyImages, setStoryImages] = useState<StoryImage[]>([]);
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUserListing, setSelectedUserListing] = useState<UserListing | null>(null);
  const [showUserListingDetails, setShowUserListingDetails] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [listingToReject, setListingToReject] = useState<UserListing | null>(null);
  const [showApprovalStep1, setShowApprovalStep1] = useState(false);
  const [showApprovalStep2, setShowApprovalStep2] = useState(false);
  const [listingToApprove, setListingToApprove] = useState<UserListing | null>(null);
  const [approvedPropertyId, setApprovedPropertyId] = useState<string | null>(null);
  
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
  const { users: realtimeUsers } = useRealtimeUsers();


  useEffect(() => {
    fetchProperties();
    fetchTeamMembers();
    fetchStoryImages();
    fetchUserListings();
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
          contactEmail: data.contactEmail || 'Not Provided',
          propertyAge: data.propertyAge,
          areaAcres: data.areaAcres,
          status: data.status
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

  const fetchUserListings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'userListings'));
      const listingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserListing[];
      
      setUserListings(listingsData);
    } catch (error) {
      console.error('Error fetching user listings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user listings",
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

  const handleDeleteUserListing = async (listingId: string, reason?: string) => {
    try {
      const listing = userListings.find(l => l.id === listingId);
      
      // If reason is provided, send WhatsApp message
      if (reason && listing) {
        const phoneNumber = listing.contactPhone.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        const message = `Hello ${listing.contactName},

Thank you for submitting your property listing "${listing.title}" on Mana Nivasam.

Unfortunately, we cannot approve your listing at this time.

*Reason:* ${reason}

Please feel free to resubmit your listing after addressing the above concern. If you have any questions, please contact our support team.

Thank you for your understanding.

Best regards,
Mana Nivasam Team`;

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }

      await deleteDoc(doc(db, 'userListings', listingId));
      setUserListings(userListings.filter(l => l.id !== listingId));
      toast({
        title: "Success",
        description: reason ? "User listing rejected and WhatsApp message sent" : "User listing deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete user listing",
        variant: "destructive",
      });
    }
  };

  const handleRejectWithReason = (listing: UserListing) => {
    setListingToReject(listing);
    setRejectionReason('');
    setShowReasonModal(true);
    setDeleteConfirmId(null); // Close delete confirmation if open
  };

  const handleConfirmRejection = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    if (listingToReject) {
      handleDeleteUserListing(listingToReject.id, rejectionReason);
      setShowReasonModal(false);
      setListingToReject(null);
      setRejectionReason('');
    }
  };

  const handleApproveUserListing = (listing: UserListing) => {
    setListingToApprove(listing);
    setShowApprovalStep1(true);
  };

  const handlePublishToWebsite = async () => {
    if (!listingToApprove) return;

    try {
      // Add to properties collection
      const propertyData = {
        title: listingToApprove.title,
        price: listingToApprove.price,
        location: listingToApprove.location,
        type: listingToApprove.type,
        category: listingToApprove.category,
        images: listingToApprove.images,
        area: listingToApprove.area,
        description: listingToApprove.description,
        featured: false,
        createdAt: new Date(),
        contactName: listingToApprove.contactName,
        contactPhone: listingToApprove.contactPhone,
        contactEmail: listingToApprove.contactEmail,
        // Copy all other relevant fields from listing
        ...listingToApprove,
        // Remove listing-specific fields
        id: undefined,
        submittedBy: undefined,
        submittedByEmail: undefined,
        submittedAt: undefined,
        approved: undefined,
      };

      // Remove undefined fields
      Object.keys(propertyData).forEach(key => {
        if (propertyData[key] === undefined) {
          delete propertyData[key];
        }
      });

      const docRef = await addDoc(collection(db, 'properties'), propertyData);
      setApprovedPropertyId(docRef.id);
      
      // Add the new property to local state immediately
      const newProperty: AdminProperty = {
        id: docRef.id,
        ...propertyData as any,
        createdAt: new Date()
      };
      setProperties([newProperty, ...properties]);
      
      // Mark as approved in userListings instead of deleting
      await updateDoc(doc(db, 'userListings', listingToApprove.id), {
        approved: true,
        approvedAt: new Date(),
        propertyId: docRef.id
      });
      
      // Update local state to reflect approval
      setUserListings(userListings.map(l => 
        l.id === listingToApprove.id 
          ? { ...l, approved: true } 
          : l
      ));
      
      // Close step 1, show step 2 with the property ID
      setShowApprovalStep1(false);
      setShowApprovalStep2(true);

    } catch (error: any) {
      console.error('Error publishing property:', error);
      toast({
        title: "Error",
        description: "Failed to publish property",
        variant: "destructive",
      });
    }
  };

  const handleSendApprovalMessage = async () => {
    if (!listingToApprove || !approvedPropertyId) return;

    // Generate WhatsApp message with actual property link
    const phoneNumber = listingToApprove.contactPhone.replace(/[^0-9]/g, '');
    const propertyUrl = `${window.location.origin}/property/${approvedPropertyId}`;

    const message = `🎉 Congratulations ${listingToApprove.contactName}! 🎉

We are excited to inform you that your property listing "${listingToApprove.title}" has been APPROVED and is now LIVE on Mana Nivasam! 🏡

✅ *Property Status:* APPROVED & PUBLISHED
📍 *Location:* ${listingToApprove.location}
💰 *Price:* ${listingToApprove.price}

🔗 *View Your Property:*
${propertyUrl}

Your property is now visible to thousands of potential buyers/renters on our platform!

Thank you for choosing Mana Nivasam. We wish you a successful transaction! 🌟

Best regards,
Mana Nivasam Team

Need help? Contact our support team anytime.`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Close step 2 modal and show success
    setShowApprovalStep2(false);
    setShowUserListingDetails(false);
    setSelectedUserListing(null);
    
    toast({
      title: "Success! 🎉",
      description: "Property published and approval message sent!",
    });

    // Reset approval states
    setTimeout(() => {
      setListingToApprove(null);
      setApprovedPropertyId(null);
    }, 1000);
  };

  const handleCancelApproval = () => {
    setShowApprovalStep1(false);
    setShowApprovalStep2(false);
    setListingToApprove(null);
    setApprovedPropertyId(null);
  };

  const handleViewUserListingDetails = (listing: UserListing) => {
    setSelectedUserListing(listing);
    setShowUserListingDetails(true);
    setCurrentImageIndex(0); // Reset to first image
  };

  const handleCloseUserListingDetails = () => {
    setShowUserListingDetails(false);
    setSelectedUserListing(null);
    setCurrentImageIndex(0);
    setSwipeOffset(0);
  };

  // Carousel navigation functions
  const nextImage = () => {
    if (selectedUserListing?.images && selectedUserListing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === selectedUserListing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedUserListing?.images && selectedUserListing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedUserListing.images.length - 1 : prev - 1
      );
    }
  };

  // Touch event handlers for swipe functionality
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    if (touchStart) {
      setSwipeOffset(currentTouch - touchStart);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
    
    // Reset swipe offset
    setSwipeOffset(0);
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
                  onClick={() => handleMobileNavClick('user-listings')}
                  className={`w-full justify-start hover:bg-blue-50 ${activeTab === 'user-listings' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                >
                  <Building className="w-4 h-4 mr-3" />
                  User Listings ({userListings.length})
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => handleMobileNavClick('analytics')}
                  className={`w-full justify-start hover:bg-blue-50 ${activeTab === 'analytics' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Analytics
                </Button>
                
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

                <Button
                  variant="ghost"
                  onClick={() => handleMobileNavClick('simple-users')}
                  className={`w-full justify-start hover:bg-blue-50 ${activeTab === 'simple-users' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                >
                  <Users className="w-4 h-4 mr-3" />
                  Real-Time Users
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleMobileNavClick('users')}
                  className={`w-full justify-start hover:bg-blue-50 ${activeTab === 'users' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                >
                  <Users className="w-4 h-4 mr-3" />
                  User Management
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleMobileNavClick('user-analytics')}
                  className={`w-full justify-start hover:bg-blue-50 ${activeTab === 'user-analytics' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  User Analytics
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleMobileNavClick('live-signups')}
                  className={`w-full justify-start hover:bg-blue-50 ${activeTab === 'live-signups' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                >
                  <Eye className="w-4 h-4 mr-3" />
                  Live Signups
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleMobileNavClick('user-settings')}
                  className={`w-full justify-start hover:bg-blue-50 ${activeTab === 'user-settings' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  User Settings
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleMobileNavClick('firebase-auth')}
                  className={`w-full justify-start hover:bg-blue-50 ${activeTab === 'firebase-auth' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                >
                  <Database className="w-4 h-4 mr-3" />
                  Firebase Auth
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => handleMobileNavClick('firebase-users')}
                  className={`w-full justify-start hover:bg-blue-50 ${activeTab === 'firebase-users' ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                >
                  <Users className="w-4 h-4 mr-3" />
                  Firebase Users
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
                       Mana Nivasam Dashboard
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 w-full">
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

            {activeTab === 'user-listings' && (
              <Card className="bg-white/60 backdrop-blur-lg border border-white/30 shadow-xl w-full">
                <CardHeader>
                  <CardTitle className="text-lg md:text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    User Submitted Listings ({userListings.length})
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Review and approve property listings submitted by users
                  </p>
                </CardHeader>
                <CardContent>
                  {userListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userListings.map((listing, index) => (
                        <div 
                          key={listing.id} 
                          className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200"
                          style={{animationDelay: `${index * 50}ms`}}
                          onClick={() => handleViewUserListingDetails(listing)}
                        >
                          {/* Content Section */}
                          <div className="p-3">
                            {/* Top Row: Price and Image */}
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1 pr-2">
                                {/* Price */}
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">{listing.price}</h3>
                                
                                {/* Title */}
                                <p className="text-sm text-gray-700 font-medium line-clamp-2 leading-tight">{listing.title}</p>
                              </div>
                              
                              {/* Small Thumbnail Image on Right */}
                              <div className="relative flex-shrink-0">
                                <img 
                                  src={listing.images && listing.images.length > 0 ? listing.images[0] : 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=200'}
                                  alt={listing.title}
                                  className="w-20 h-16 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=200';
                                  }}
                                />
                                {/* Delete Icon */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmId(listing.id);
                                  }}
                                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
                                  title="Delete listing"
                                >
                                  <Trash2 className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Location */}
                            <div className="flex items-start text-xs text-gray-500 mb-0.5">
                              <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1 leading-tight">{listing.location}</span>
                            </div>

                            {/* Area Info */}
                            {listing.area && (
                              <p className="text-xs text-gray-600 mb-1.5 leading-tight">Carpet Area {listing.area}</p>
                            )}

                            {/* Category Badge */}
                            <div className="mb-1.5 flex gap-1 flex-wrap">
                              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                {listing.category}
                              </span>
                              {listing.approved && (
                                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  ✓ Approved
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {!listing.approved ? (
                              <div className="grid grid-cols-2 gap-2">
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectWithReason(listing);
                                  }}
                                  className="w-full border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold py-1.5 h-8"
                                >
                                  Reject
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApproveUserListing(listing);
                                  }}
                                  className="w-full bg-green-50 border-2 border-green-300 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold py-1.5 h-8"
                                >
                                  Approve
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="text-center py-1.5 bg-green-50 rounded-lg">
                                  <p className="text-xs text-green-700 font-semibold">
                                    ✓ Published & Notified
                                  </p>
                                </div>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmId(listing.id);
                                  }}
                                  className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold py-1.5 h-8"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete Record
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Building className="w-8 h-8 md:w-10 md:h-10 text-gray-500" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">No User Listings</h3>
                      <p className="text-gray-600 mb-6 text-sm md:text-base">
                        No property listings have been submitted by users yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Visitor Analytics
                  </h2>
                  <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
                    <span className="text-sm font-medium text-green-800">Real-time Data</span>
                  </div>
                </div>
                
                <VisitorStatsCard className="w-full" />
                
                {/* Firebase Auth Summary */}
                <FirebaseAuthSummary className="w-full" />
                
                {/* Migration Panel - Only show for admins */}
                <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-700">
                      System Migration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VisitorDataMigrationPanel />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Simple Real-Time Users Tab */}
            {activeTab === 'simple-users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Real-Time Users from Firestore
                  </h2>
                  <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
                    <span className="text-sm font-medium text-green-800">Live Data • Firebase</span>
                  </div>
                </div>
                
                <SimpleUserDashboard className="w-full" />
              </div>
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    User Management
                  </h2>
                  <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                    <span className="text-sm font-medium text-blue-800">Real-time Data</span>
                  </div>
                </div>
                
                <UserManagementPanel className="w-full" />
              </div>
            )}

            {/* User Analytics Tab */}
            {activeTab === 'user-analytics' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    User Analytics Dashboard
                  </h2>
                  <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
                    <span className="text-sm font-medium text-green-800">Live Analytics</span>
                  </div>
                </div>
                
                <UserAnalyticsDashboard className="w-full" />
              </div>
            )}

            {/* Live User Signups Tab */}
            {activeTab === 'live-signups' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Live User Signups
                  </h2>
                  <div className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 rounded-full">
                    <span className="text-sm font-medium text-orange-800">Real-time</span>
                  </div>
                </div>
                
                <RealtimeUserSignups 
                  className="w-full" 
                  onUserClick={(user) => {
                    // You can add logic here to show user details or switch to user management tab
                    setActiveTab('users');
                  }}
                />
              </div>
            )}

            {/* User Settings Tab */}
            {activeTab === 'user-settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-600 to-blue-600 bg-clip-text text-transparent">
                    User Management Settings
                  </h2>
                  <div className="px-3 py-1 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full">
                    <span className="text-sm font-medium text-gray-800">Configuration</span>
                  </div>
                </div>
                
                <UserSettingsPanel users={realtimeUsers} className="w-full" />
              </div>
            )}

            {/* Firebase Auth Dashboard Tab */}
            {activeTab === 'firebase-auth' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    Firebase Authentication Dashboard
                  </h2>
                  <div className="px-3 py-1 bg-gradient-to-r from-red-100 to-orange-100 rounded-full">
                    <span className="text-sm font-medium text-red-800">Firebase Auth</span>
                  </div>
                </div>
                
                <FirebaseAuthDashboard className="w-full" />
              </div>
            )}

            {/* Firebase Users Management Tab */}
            {activeTab === 'firebase-users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Firebase Users Management
                  </h2>
                  <div className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full">
                    <span className="text-sm font-medium text-indigo-800">Direct Auth Integration</span>
                  </div>
                </div>
                
                <FirebaseAuthUserManagement className="w-full" />
              </div>
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

      {/* User Listing Details Modal */}
      {showUserListingDetails && selectedUserListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseUserListingDetails}
                className="h-8 w-8 p-0 transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Image Carousel */}
              {selectedUserListing.images && selectedUserListing.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Property Images</h3>
                  <div className="max-w-md mx-auto md:max-w-sm">
                  <div 
                    className="relative aspect-[16/10] md:aspect-video rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    <div 
                      className="w-full h-full transition-transform"
                      style={{ 
                        transform: `translateX(${swipeOffset}px)`,
                        transitionDuration: swipeOffset === 0 ? '300ms' : '0ms'
                      }}
                    >
                      <img
                        src={selectedUserListing.images[currentImageIndex]}
                        alt={`${selectedUserListing.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=400';
                        }}
                      />
                    </div>

                    {/* Navigation Arrows */}
                    {selectedUserListing.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95 z-10"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-800" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95 z-10"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-800" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs">
                      {currentImageIndex + 1} / {selectedUserListing.images.length}
                    </div>

                    {/* Dot Indicators for Mobile */}
                    {selectedUserListing.images.length > 1 && selectedUserListing.images.length <= 10 && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 md:hidden">
                        {selectedUserListing.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(index);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              index === currentImageIndex 
                                ? 'bg-white w-4' 
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  </div>

                  {/* Thumbnail Strip */}
                  {selectedUserListing.images.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                      {selectedUserListing.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                            index === currentImageIndex 
                              ? 'border-blue-500 ring-1 ring-blue-200' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=400';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Basic Information */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedUserListing.title}</h3>
                <p className="text-lg text-gray-600 mb-2">{selectedUserListing.location}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {selectedUserListing.category}
                  </span>
                  {selectedUserListing.type && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      {selectedUserListing.type}
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  {selectedUserListing.price}
                </p>
              </div>

              {/* Property Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-semibold">{selectedUserListing.area}</span>
                  </div>
                  {(selectedUserListing as any).areaAcres && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Area (Acres):</span>
                      <span className="font-semibold">{(selectedUserListing as any).areaAcres} acres</span>
                    </div>
                  )}
                  {(selectedUserListing as any).bedrooms && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Bedrooms:</span>
                      <span className="font-semibold">{(selectedUserListing as any).bedrooms}</span>
                    </div>
                  )}
                  {(selectedUserListing as any).bathrooms && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Bathrooms:</span>
                      <span className="font-semibold">{(selectedUserListing as any).bathrooms}</span>
                    </div>
                  )}
                  {(selectedUserListing as any).propertyAge !== undefined && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Property Age:</span>
                      <span className="font-semibold">{(selectedUserListing as any).propertyAge} years</span>
                    </div>
                  )}
                  {(selectedUserListing as any).status && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold">{(selectedUserListing as any).status}</span>
                    </div>
                  )}
                  {(selectedUserListing as any).furnishingStatus && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Furnishing:</span>
                      <span className="font-semibold">{(selectedUserListing as any).furnishingStatus}</span>
                    </div>
                  )}
                  {(selectedUserListing as any).facing && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">Facing:</span>
                      <span className="font-semibold">{(selectedUserListing as any).facing}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {(selectedUserListing as any).amenities && (selectedUserListing as any).amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedUserListing as any).amenities.map((amenity: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedUserListing.description}</p>
              </div>

              {/* Contact Information */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold mb-3 text-yellow-900">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact Name:</span>
                    <span className="font-semibold">{selectedUserListing.contactName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold">{selectedUserListing.contactPhone}</span>
                  </div>
                  {selectedUserListing.contactEmail && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold">{selectedUserListing.contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submission Information */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-3 text-blue-900">Submission Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted By:</span>
                    <span className="font-semibold">{selectedUserListing.submittedByEmail}</span>
                  </div>
                  {selectedUserListing.submittedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted On:</span>
                      <span className="font-semibold">
                        {(() => {
                          try {
                            let date: Date;
                            if (selectedUserListing.submittedAt?.toDate) {
                              date = selectedUserListing.submittedAt.toDate();
                            } else if (selectedUserListing.submittedAt?.seconds) {
                              date = new Date(selectedUserListing.submittedAt.seconds * 1000);
                            } else if (typeof selectedUserListing.submittedAt === 'string') {
                              date = parseISO(selectedUserListing.submittedAt);
                            } else if (selectedUserListing.submittedAt instanceof Date) {
                              date = selectedUserListing.submittedAt;
                            } else {
                              return 'N/A';
                            }
                            return isValid(date) ? format(date, 'dd MMM yyyy, HH:mm') : 'N/A';
                          } catch {
                            return 'N/A';
                          }
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <Button
                  onClick={() => handleApproveUserListing(selectedUserListing)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                >
                  Approve & Publish
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleRejectWithReason(selectedUserListing);
                    handleCloseUserListingDetails();
                  }}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseUserListingDetails}
                  className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showReasonModal && listingToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Rejection Reason</h3>
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setListingToReject(null);
                  setRejectionReason('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Property:</span> {listingToReject.title}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Submitted by:</span> {listingToReject.contactName}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Phone:</span> {listingToReject.contactPhone}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejecting this listing..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be sent to the user via WhatsApp
              </p>
            </div>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> After clicking "Send & Reject", a WhatsApp message will be opened with the preset message. You can review and send it to the user.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReasonModal(false);
                  setListingToReject(null);
                  setRejectionReason('');
                }}
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRejection}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Send & Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Step 1: Publish to Website */}
      {showApprovalStep1 && listingToApprove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-6 transform transition-all">
            {/* Desktop: Two steps side by side */}
            <div className="hidden md:block">
              <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Approval Process
              </h2>
              
              <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                {/* Step 1 - Publish */}
                <div className="border-2 border-purple-200 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-blue-50">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mb-4">
                    <span className="text-3xl">🚀</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-center mb-2 text-purple-600">
                    Step 1: Publish
                  </h3>
                  
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Publish property to website
                  </p>

                  <div className="mb-4 p-3 bg-white rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-semibold">Property:</span> {listingToApprove.title}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-semibold">User:</span> {listingToApprove.contactName}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Location:</span> {listingToApprove.location}
                    </p>
                  </div>

                  <Button
                    onClick={handlePublishToWebsite}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    Publish Now �
                  </Button>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-xs text-gray-500 mt-2">Then</span>
                </div>

                {/* Step 2 Preview - Send Message */}
                <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50 opacity-60">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-200 rounded-full mb-4">
                    <span className="text-3xl">�</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-center mb-2 text-gray-600">
                    Step 2: Send Message
                  </h3>
                  
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Send WhatsApp with link
                  </p>

                  <div className="mb-4 p-3 bg-white rounded-lg border border-gray-300">
                    <p className="text-center text-sm text-gray-500">
                      Available after Step 1
                    </p>
                  </div>

                  <Button
                    disabled
                    className="w-full bg-gray-400 text-white cursor-not-allowed"
                  >
                    Send Message �
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={handleCancelApproval}
                  className="px-8"
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* Mobile: Single step */}
            <div className="md:hidden">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              
              <h3 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Step 1: Publish to Website
              </h3>
              
              <p className="text-sm text-gray-600 text-center mb-4">
                First, publish this property to the main website
              </p>

              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Property:</span> {listingToApprove.title}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Submitted by:</span> {listingToApprove.contactName}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Phone:</span> {listingToApprove.contactPhone}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Location:</span> {listingToApprove.location}
                </p>
              </div>

              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-purple-800">
                  <strong>� What happens next:</strong> The property will be published and you'll be able to send the approval message with the property link.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelApproval}
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePublishToWebsite}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Publish Now �
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Step 2: Send WhatsApp Message */}
      {showApprovalStep2 && listingToApprove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-6 transform transition-all">
            {/* Desktop: Two steps side by side */}
            <div className="hidden md:block">
              <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Approval Process
              </h2>
              
              <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                {/* Step 1 Completed - Published */}
                <div className="border-2 border-purple-500 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-blue-50 relative">
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-purple-500 rounded-full mb-4">
                    <span className="text-3xl">✅</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-center mb-2 text-purple-600">
                    Step 1: Completed
                  </h3>
                  
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Property published successfully
                  </p>

                  <div className="mb-4 p-3 bg-white rounded-lg border border-purple-200">
                    <p className="text-center text-sm font-semibold text-purple-700">
                      � Published!
                    </p>
                    <p className="text-center text-xs text-gray-600 mt-1">
                      Property is now live
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-green-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-xs text-green-600 mt-2 font-semibold">Now</span>
                </div>

                {/* Step 2 Active - Send Message */}
                <div className="border-2 border-green-500 rounded-lg p-6 bg-gradient-to-br from-green-50 to-teal-50 shadow-lg">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-teal-100 rounded-full mb-4 animate-bounce">
                    <span className="text-3xl">�</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-center mb-2 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    Step 2: Send Message
                  </h3>
                  
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Send WhatsApp with property link
                  </p>

                  <div className="mb-4 p-3 bg-white rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-semibold text-center">
                      Ready to notify user!
                    </p>
                    <p className="text-xs text-gray-600 text-center mt-1">
                      {listingToApprove.contactName}
                    </p>
                  </div>

                  <Button
                    onClick={handleSendApprovalMessage}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                  >
                    Send Message �
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={handleCancelApproval}
                  className="px-8"
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* Mobile: Single step */}
            <div className="md:hidden">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-teal-100 rounded-full mb-4">
                <span className="text-3xl">�</span>
              </div>
              
              <h3 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Step 2: Send Approval Message
              </h3>
              
              <p className="text-sm text-gray-600 text-center mb-4">
                Now, send the congratulations message with property link
              </p>

              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-center text-sm font-semibold text-gray-800 mb-1">
                  Property Published Successfully!
                </p>
                <p className="text-center text-xs text-gray-600">
                  "{listingToApprove.title}" is now live
                </p>
              </div>

              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  <strong>📱 WhatsApp Message:</strong> A congratulations message with the property link will be sent to {listingToApprove.contactName}.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelApproval}
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendApprovalMessage}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                >
                  Send Message �
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 transform transition-all">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              {userListings.find(l => l.id === deleteConfirmId)?.approved 
                ? 'Delete Approved Record?' 
                : 'Delete Listing?'}
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              {userListings.find(l => l.id === deleteConfirmId)?.approved 
                ? 'This will only delete the submission record. The published property will remain on the website.'
                : 'Are you sure you want to delete this listing? This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleDeleteUserListing(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

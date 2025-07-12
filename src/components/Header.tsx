import React, { useState, useEffect, useRef } from 'react';
import { User, Home, ShoppingCart, Building, Users, Info, X, Menu, Landmark, Phone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileInfoPopup from '@/components/ProfileInfoPopup';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnHeroSection, setIsOnHeroSection] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Check if we're on PropertyDetails page
  const isPropertyDetailsPage = location.pathname.startsWith('/property/');

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    if (!currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const checkHeroSection = () => {
      const heroSection = document.querySelector('section');
      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        const headerHeight = 80;
        setIsOnHeroSection(heroRect.top <= headerHeight && heroRect.bottom > headerHeight);
      }
    };

    checkHeroSection();
    window.addEventListener('scroll', checkHeroSection);
    window.addEventListener('resize', checkHeroSection);

    return () => {
      window.removeEventListener('scroll', checkHeroSection);
      window.removeEventListener('resize', checkHeroSection);
    };
  }, []);

  // Enhanced mobile menu outside click handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        // Check if click is not on the menu button itself
        const menuButton = document.querySelector('[aria-label="Toggle menu"]');
        if (menuButton && !menuButton.contains(event.target as Node)) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      // Add event listener with capture to handle clicks before they reach other elements
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('touchstart', handleClickOutside, true);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when menu is closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      const heroSection = document.querySelector('#hero');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (isMobile && currentUser) {
      setShowProfilePopup(true);
    } else if (currentUser) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
    setIsMenuOpen(false);
  };

  const handleSearchClick = () => {
    if (location.pathname === '/') {
      // Already on home page, scroll to hero section and focus search input
      const heroSection = document.querySelector('#hero');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          // Target the specific "Search Anything" input field using correct IDs
          const searchInput = document.getElementById('search-anything-input') as HTMLInputElement ||
                            document.getElementById('search-anything-input-mobile') as HTMLInputElement;
          console.log('Search input found:', searchInput);
          if (searchInput) {
            searchInput.focus();
            searchInput.click();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log('Successfully focused on search input');
          } else {
            console.log('Search input not found with IDs, trying placeholder selector');
            // Try by placeholder as fallback
            const fallbackInput = document.querySelector('input[placeholder*="Enter anything related to properties"]') as HTMLInputElement;
            if (fallbackInput) {
              fallbackInput.focus();
              fallbackInput.click();
            }
          }
        }, 500);
      }
    } else {
      // Navigate to home page first, then focus search
      navigate('/');
      setTimeout(() => {
        const heroSection = document.querySelector('#hero');
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            const searchInput = document.getElementById('search-anything-input') as HTMLInputElement ||
                              document.getElementById('search-anything-input-mobile') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
              searchInput.click();
              searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 500);
        }
      }, 100);
    }
    setIsMenuOpen(false);
  };

  // Enhanced text visibility classes with better contrast and font weight
  // Dynamic colors: white on dark backgrounds, black on light backgrounds
  const getTextColorClass = () => {
    if (isPropertyDetailsPage) {
      return 'text-gray-900 font-bold'; // Black text on light background
    }
    return isOnHeroSection ? 'text-white font-semibold' : 'text-gray-900 font-medium'; // White on hero (dark), black elsewhere
  };

  const getHoverColorClass = () => {
    if (isPropertyDetailsPage) {
      return 'hover:text-purple-600'; // Purple hover on light background
    }
    return isOnHeroSection ? 'hover:text-gray-200' : 'hover:text-purple-600'; // Light gray on dark, purple on light
  };

  const getLogoTextClass = () => {
    if (isPropertyDetailsPage) {
      return 'text-gray-900 font-bold'; // Black logo on light background
    }
    return isOnHeroSection ? 'text-white font-bold' : 'text-gray-900 font-bold'; // White on hero, black elsewhere
  };

  const getSubtitleTextClass = () => {
    if (isPropertyDetailsPage) {
      return 'text-gray-700 font-medium'; // Dark gray on light background
    }
    return isOnHeroSection ? 'text-gray-100 font-medium' : 'text-gray-600'; // Light gray on dark, dark gray on light
  };

  const getMenuButtonClass = () => {
    if (isPropertyDetailsPage) {
      return 'text-gray-900 hover:bg-gray-100/40 font-bold'; // Black text with light hover on light background
    }
    return isOnHeroSection ? 'text-white hover:bg-white/20 font-medium' : 'text-gray-900 hover:bg-gray-100/20'; // White on dark, black on light
  };

  const getHeaderBgClass = () => {
    if (isPropertyDetailsPage) {
      return 'border-gray-200/30 bg-white/95 backdrop-blur-md';
    }
    return isOnHeroSection ? 'border-white/20 bg-black/40 backdrop-blur-md' : 'border-white/20';
  };

  const textColorClass = getTextColorClass();
  const hoverColorClass = getHoverColorClass();
  const logoTextClass = getLogoTextClass();
  const subtitleTextClass = getSubtitleTextClass();
  const menuButtonClass = getMenuButtonClass();

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 glass border-b ${getHeaderBgClass()}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            {/* Logo */}
            <div 
              className="flex items-center space-x-2 cursor-pointer min-h-[44px] min-w-[44px] py-2 -ml-2 pl-2 rounded-lg transition-colors duration-200 hover:bg-white/10"
              onClick={handleLogoClick}
            >
              <img 
                src="https://i.ibb.co/n8rMxsmw/IMG-20250707-184211.webp"
                alt="Mana Nivasam Logo"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
              <div className="flex flex-col justify-center items-start mt-1">
                <h1 className={`text-sm sm:text-base ${logoTextClass} drop-shadow-lg leading-tight`}>Mana Nivasam</h1>
                <p className={`text-xs ${subtitleTextClass} hidden sm:block drop-shadow-md`}></p>
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <a href="/" className={`${textColorClass} ${hoverColorClass} transition-colors flex items-center gap-2 drop-shadow-lg`}>
                <Home className="w-4 h-4" />
                Home
              </a>
              <a href="/buy" className={`${textColorClass} ${hoverColorClass} transition-colors flex items-center gap-2 drop-shadow-lg`}>
                <ShoppingCart className="w-4 h-4" />
                Buy
              </a>
              <a href="/rent" className={`${textColorClass} ${hoverColorClass} transition-colors flex items-center gap-2 drop-shadow-lg`}>
                <Building className="w-4 h-4" />
                Rent
              </a>
              <a href="/land" className={`${textColorClass} ${hoverColorClass} transition-colors flex items-center gap-2 drop-shadow-lg`}>
                <Landmark className="w-4 h-4" />
                Land
              </a>
              <a href="/commercial" className={`${textColorClass} ${hoverColorClass} transition-colors flex items-center gap-2 drop-shadow-lg`}>
                <Building className="w-4 h-4" />
                Commercial
              </a>
              <a href="/pg-hostels" className={`${textColorClass} ${hoverColorClass} transition-colors flex items-center gap-2 drop-shadow-lg`}>
                <Users className="w-4 h-4" />
                PG/Hostels
              </a>
              <a href="/about" className={`${textColorClass} ${hoverColorClass} transition-colors flex items-center gap-2 drop-shadow-lg`}>
                <Info className="w-4 h-4" />
                About
              </a>
              <a href="/contact" className={`${textColorClass} ${hoverColorClass} transition-colors flex items-center gap-2 drop-shadow-lg`}>
                <Phone className="w-4 h-4" />
                Contact
              </a>
            </nav>

            {/* Right Side - Mobile Menu */}
            <div className="flex items-center space-x-2">
              {/* Search Button - Desktop */}
              {!isMobile && (
                <button
                  onClick={handleSearchClick}
                  className={`hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg ${textColorClass} ${hoverColorClass} transition-all duration-200 hover:bg-white/10`}
                >
                  <Search className="w-5 h-5" />
                  <span className="text-sm font-medium"></span>
                </button>
              )}
              
              {/* Profile Button - Desktop */}
              {!isMobile && (
                <button
                  onClick={handleProfileClick}
                  className={`hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg ${textColorClass} ${hoverColorClass} transition-all duration-200 hover:bg-white/10`}
                >
                  <User className="w-5 h-5" />
                  {currentUser ? (
                    <span className="text-sm font-medium">Profile</span>
                  ) : (
                    <span className="text-sm font-medium">Login</span>
                  )}
                </button>
              )}

              {/* Mobile Menu Button */}
              <button 
                className={`lg:hidden p-2 rounded-lg ${menuButtonClass} transition-colors shadow-lg relative z-[9999]`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu - Full screen overlay with backdrop */}
          {isMenuOpen && (
            <>
              {/* Enhanced Backdrop with proper z-index */}
              <div 
                className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[9997]"
                onClick={() => setIsMenuOpen(false)}
              />
              
              {/* Menu Content - Full screen overlay */}
              <div 
                ref={mobileMenuRef}
                className={`lg:hidden fixed inset-0 z-[9998] ${
                  isPropertyDetailsPage 
                    ? 'bg-white' 
                    : isOnHeroSection 
                      ? 'bg-gray-900' 
                      : 'bg-white'
                } shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto`}
                style={{
                  transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
                  height: '100vh',
                  width: '100vw'
                }}
              >
                {/* Menu Header */}
                <div className="flex items-center justify-center p-4 border-b border-gray-200/20">
                  <h2 className={`text-lg font-semibold ${textColorClass}`}>Menu</h2>
                </div>

                {/* Menu Items */}
                <nav className="py-4">
                  <a 
                    href="/" 
                    className={`${textColorClass} ${hoverColorClass} ${
                      isPropertyDetailsPage 
                        ? 'hover:bg-gray-50' 
                        : isOnHeroSection 
                          ? 'hover:bg-white/10' 
                          : 'hover:bg-purple-50'
                    } transition-colors px-6 py-4 flex items-center gap-3 font-medium`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="w-5 h-5" />
                    Home
                  </a>
                  
                  <a 
                    href="/buy" 
                    className={`${textColorClass} ${hoverColorClass} ${
                      isPropertyDetailsPage 
                        ? 'hover:bg-gray-50' 
                        : isOnHeroSection 
                          ? 'hover:bg-white/10' 
                          : 'hover:bg-purple-50'
                    } transition-colors px-6 py-4 flex items-center gap-3 font-medium`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Buy
                  </a>
                  
                  <a 
                    href="/rent" 
                    className={`${textColorClass} ${hoverColorClass} ${
                      isPropertyDetailsPage 
                        ? 'hover:bg-gray-50' 
                        : isOnHeroSection 
                          ? 'hover:bg-white/10' 
                          : 'hover:bg-purple-50'
                    } transition-colors px-6 py-4 flex items-center gap-3 font-medium`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Building className="w-5 h-5" />
                    Rent
                  </a>
                  
                  <a 
                    href="/land" 
                    className={`${textColorClass} ${hoverColorClass} ${
                      isPropertyDetailsPage 
                        ? 'hover:bg-gray-50' 
                        : isOnHeroSection 
                          ? 'hover:bg-white/10' 
                          : 'hover:bg-purple-50'
                    } transition-colors px-6 py-4 flex items-center gap-3 font-medium`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Landmark className="w-5 h-5" />
                    Land
                  </a>
                  
                  <a 
                    href="/commercial" 
                    className={`${textColorClass} ${hoverColorClass} ${
                      isPropertyDetailsPage 
                        ? 'hover:bg-gray-50' 
                        : isOnHeroSection 
                          ? 'hover:bg-white/10' 
                          : 'hover:bg-purple-50'
                    } transition-colors px-6 py-4 flex items-center gap-3 font-medium`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Building className="w-5 h-5" />
                    Commercial
                  </a>
                  
                  <a 
                    href="/pg-hostels" 
                    className={`${textColorClass} ${hoverColorClass} ${
                      isPropertyDetailsPage 
                        ? 'hover:bg-gray-50' 
                        : isOnHeroSection 
                          ? 'hover:bg-white/10' 
                          : 'hover:bg-purple-50'
                    } transition-colors px-6 py-4 flex items-center gap-3 font-medium`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Users className="w-5 h-5" />
                    PG/Hostels
                  </a>
                  
                  <a 
                    href="/about" 
                    className={`${textColorClass} ${hoverColorClass} ${
                      isPropertyDetailsPage 
                        ? 'hover:bg-gray-50' 
                        : isOnHeroSection 
                          ? 'hover:bg-white/10' 
                          : 'hover:bg-purple-50'
                    } transition-colors px-6 py-4 flex items-center gap-3 font-medium`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Info className="w-5 h-5" />
                    About
                  </a>
                  
                  <a 
                    href="/contact" 
                    className={`${textColorClass} ${hoverColorClass} ${
                      isPropertyDetailsPage 
                        ? 'hover:bg-gray-50' 
                        : isOnHeroSection 
                          ? 'hover:bg-white/10' 
                          : 'hover:bg-purple-50'
                    } transition-colors px-6 py-4 flex items-center gap-3 font-medium`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Phone className="w-5 h-5" />
                    Contact
                  </a>
                  
                  {/* Search Button in Mobile Menu */}
                  <button
                    onClick={handleSearchClick}
                    className={`${textColorClass} ${hoverColorClass} ${
                      isPropertyDetailsPage 
                        ? 'hover:bg-gray-50' 
                        : isOnHeroSection 
                          ? 'hover:bg-white/10' 
                          : 'hover:bg-purple-50'
                    } transition-colors px-6 py-4 flex items-center gap-3 font-medium w-full text-left`}
                  >
                    <Search className="w-5 h-5" />
                    Search Properties
                  </button>
                  
                  {/* Profile/Login Section in Mobile Menu */}
                  <div className="border-t border-gray-200/20 mt-4 pt-4">
                    <button
                      onClick={handleProfileClick}
                      className={`${textColorClass} ${hoverColorClass} ${
                        isPropertyDetailsPage 
                          ? 'hover:bg-gray-50' 
                          : isOnHeroSection 
                            ? 'hover:bg-white/10' 
                            : 'hover:bg-purple-50'
                      } transition-colors px-6 py-4 flex items-center gap-3 font-medium w-full text-left`}
                    >
                      <User className="w-5 h-5" />
                      {currentUser ? 'Profile' : 'Login'}
                    </button>
                  </div>
                </nav>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Profile Info Popup */}
      <ProfileInfoPopup
        isVisible={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
        userProfile={userProfile}
      />
    </>
  );
};

export default Header;

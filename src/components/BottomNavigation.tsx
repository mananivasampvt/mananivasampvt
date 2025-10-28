
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, Calculator } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll to show/hide bottom nav
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when at the top of the page
      if (currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Show navbar when scrolling up
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } 
      // Hide navbar when scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    if (isMobile) {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY, isMobile]);

  // Only show on mobile
  if (!isMobile) return null;

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      const heroSection = document.querySelector('#hero');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      // Ensure page scrolls to top when navigating to home
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSearchClick = () => {
    if (location.pathname === '/') {
      // Already on home page, scroll to hero section and focus search input
      const heroSection = document.querySelector('#hero');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          // Try to find the search input with improved logic
          const findAndFocusSearchInput = () => {
            // First try mobile input (more likely on mobile bottom nav)
            let searchInput = document.getElementById('search-anything-input-mobile') as HTMLInputElement;
            
            // If mobile not found, try desktop
            if (!searchInput) {
              searchInput = document.getElementById('search-anything-input') as HTMLInputElement;
            }
            
            // If still not found, try by placeholder
            if (!searchInput) {
              searchInput = document.querySelector('input[placeholder*="Enter anything related to properties"]') as HTMLInputElement;
            }
            
            if (searchInput) {
              searchInput.focus();
              searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Trigger a click to ensure mobile keyboards appear
              searchInput.click();
              console.log('Successfully focused on search input');
              return true;
            }
            
            console.log('Search input not found');
            return false;
          };

          // Try immediately
          if (!findAndFocusSearchInput()) {
            // If not found, wait a bit more and try again
            setTimeout(findAndFocusSearchInput, 500);
          }
        }, 800);
      }
    } else {
      // Navigate to home page first
      navigate('/');
      setTimeout(() => {
        const heroSection = document.querySelector('#hero');
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            // Try to find the search input with improved logic
            const findAndFocusSearchInput = () => {
              // First try mobile input (more likely on mobile bottom nav)
              let searchInput = document.getElementById('search-anything-input-mobile') as HTMLInputElement;
              
              // If mobile not found, try desktop
              if (!searchInput) {
                searchInput = document.getElementById('search-anything-input') as HTMLInputElement;
              }
              
              // If still not found, try by placeholder
              if (!searchInput) {
                searchInput = document.querySelector('input[placeholder*="Enter anything related to properties"]') as HTMLInputElement;
              }
              
              if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Trigger a click to ensure mobile keyboards appear
                searchInput.click();
                console.log('Successfully focused on search input after navigation');
                return true;
              }
              
              console.log('Search input not found after navigation');
              return false;
            };

            // Try immediately
            if (!findAndFocusSearchInput()) {
              // If not found, wait a bit more and try again
              setTimeout(findAndFocusSearchInput, 500);
            }
          }, 1000);
        }
      }, 300);
    }
  };

  const handleEMICalculatorClick = () => {
    navigate('/emi-calculator');
    // Ensure page scrolls to top when navigating to EMI calculator
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleShortlistClick = () => {
    if (currentUser) {
      navigate('/shortlist');
      // Ensure page scrolls to top after navigation
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    } else {
      navigate('/login');
    }
  };

  const handleProfileClick = () => {
    if (currentUser) {
      navigate('/profile');
      // Ensure page scrolls to top when navigating to profile
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 md:hidden transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center justify-around py-2 px-2">
        <button
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
            isActive('/') 
              ? 'text-red-600 bg-red-50' 
              : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Home</span>
        </button>

        <button
          onClick={handleSearchClick}
          className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-red-600 hover:bg-gray-50"
        >
          <Search className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Search</span>
        </button>

        <button
          onClick={handleEMICalculatorClick}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
            isActive('/emi-calculator') 
              ? 'text-red-600 bg-red-50' 
              : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
          }`}
        >
          <Calculator className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">EMI</span>
        </button>

        <button
          onClick={handleShortlistClick}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
            isActive('/shortlist') 
              ? 'text-red-600 bg-red-50' 
              : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
          }`}
        >
          <Heart className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Shortlist</span>
        </button>

        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
            isActive('/profile') 
              ? 'text-red-600 bg-red-50' 
              : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
          }`}
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;

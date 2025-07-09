
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileInfoPopupProps {
  isVisible: boolean;
  onClose: () => void;
  userProfile: any;
}

const ProfileInfoPopup: React.FC<ProfileInfoPopupProps> = ({ isVisible, onClose, userProfile }) => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const popup = document.getElementById('profile-info-popup');
      if (popup && !popup.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible || !currentUser) return null;

  // Create a new div for the popup if it doesn't exist
  let portalRoot = document.getElementById('popup-portal');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'popup-portal';
    portalRoot.style.position = 'fixed';
    portalRoot.style.top = '0';
    portalRoot.style.left = '0';
    portalRoot.style.right = '0';
    portalRoot.style.bottom = '0';
    portalRoot.style.zIndex = '999999';
    portalRoot.style.pointerEvents = 'none';
    document.body.appendChild(portalRoot);
  }

  // Create portal to render popup at the root level
  return createPortal(
    <div 
      className="fixed inset-0"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        pointerEvents: 'none'
      }}
    >
      <div 
        id="profile-info-popup"
        className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-[280px] animate-fade-in"
        style={{
          position: 'absolute',
          top: '80px',
          right: '16px',
          zIndex: 999999,
          pointerEvents: 'auto',
          transform: 'translate3d(0, 0, 0)',
          isolation: 'isolate',
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="text-sm">
          <div className="font-medium text-gray-900 mb-1">
            Email: {currentUser.email || 'snsnarayanachodisetti@gmail.com'}
          </div>
          <div className="text-gray-500">
            Join Date: Joined 29/06/2025
          </div>
        </div>
        <div className="absolute top-2 right-0 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white transform -translate-y-full"></div>
      </div>
    </div>,
    portalRoot
  );
};

export default ProfileInfoPopup;

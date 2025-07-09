
import React from 'react';

interface LoadingScreenProps {
  isVisible: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible }) => {
  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 visible' 
          : 'opacity-0 invisible pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center justify-center px-6 py-8">
        {/* Logo Container */}
        <div className={`relative mb-8 mt-8 transition-all duration-1000 ease-out ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-90 translate-y-8'
        }`}>
          {/* Logo */}
          <div className="flex items-center justify-center ml-4 relative">
            <img 
              src="https://i.ibb.co/39dX7HZC/Untitled-design-20250707-164414-0000.webp"
              alt="Mana Nivasam Logo"
              className="w-[500px] h-[500px] sm:w-[550px] sm:h-[550px] lg:w-[600px] lg:h-[600px] object-contain relative z-10"
            />
          </div>
        </div>

        {/* Brand Name - Increased Spacing */}
        <div className={`text-center transition-all duration-1000 ease-out delay-300 ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-semibold text-gray-800 tracking-wide font-inter mb-3">
            
          </h1>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

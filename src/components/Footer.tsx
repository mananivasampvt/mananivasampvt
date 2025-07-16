
import React from 'react';
import { Home, Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-premium-gradient rounded-xl flex items-center justify-center">
                <Home className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold">Mana Nivasam</h3>
                <p className="text-xs md:text-sm text-gray-400">Premium Properties</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base leading-relaxed">
              Your trusted partner in finding the perfect property. We specialize in luxury real estate 
              with a commitment to excellence and personalized service.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/share/16ovnVhmA8/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600/20 transition-colors duration-300 touch-target"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/mananivasampvt?igsh=MmQ3ZnF5MHB4N2pl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-pink-600/20 transition-colors duration-300 touch-target"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com/@mananivasampvt?si=rMOK60xL8lfWuNW7" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 md:w-10 md:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-600/20 transition-colors duration-300 touch-target"
                aria-label="Subscribe to our YouTube channel"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Get the App Section */}
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">Get the App</h4>
            <div className="space-y-3 md:space-y-4">
              <div className="group">
                <div 
                  onClick={(e) => {
                    // Get the button's position for relative tooltip placement
                    const rect = e.currentTarget.getBoundingClientRect();
                    
                    // Create tooltip with better styling
                    const tooltip = document.createElement('div');
                    tooltip.innerHTML = `
                      <div class="flex items-center space-x-2">
                        <svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                        </svg>
                        <span>App coming soon to Google Play!</span>
                      </div>
                    `;
                    
                    tooltip.className = 'fixed bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3 rounded-xl text-sm z-[9999] pointer-events-none shadow-2xl border border-gray-600 backdrop-blur-sm';
                    
                    // Position tooltip above the button
                    tooltip.style.left = `${rect.left + rect.width / 2}px`;
                    tooltip.style.top = `${rect.top - 10}px`;
                    tooltip.style.transform = 'translate(-50%, -100%)';
                    tooltip.style.opacity = '0';
                    tooltip.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    tooltip.style.animation = 'none';
                    
                    document.body.appendChild(tooltip);
                    
                    // Trigger animation
                    requestAnimationFrame(() => {
                      tooltip.style.opacity = '1';
                      tooltip.style.transform = 'translate(-50%, -100%) translateY(-8px) scale(1)';
                    });
                    
                    // Remove tooltip with fade out
                    setTimeout(() => {
                      if (document.body.contains(tooltip)) {
                        tooltip.style.opacity = '0';
                        tooltip.style.transform = 'translate(-50%, -100%) translateY(-4px) scale(0.95)';
                        setTimeout(() => {
                          if (document.body.contains(tooltip)) {
                            document.body.removeChild(tooltip);
                          }
                        }, 300);
                      }
                    }, 2500);
                  }}
                  className="relative transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer select-none group"
                  style={{ minHeight: '48px', minWidth: '48px' }}
                >
                  {/* Official Google Play Badge */}
                  <div className="relative">
                    <img 
                      src="https://camo.githubusercontent.com/899b11c87da7fe33fedafd4a4cf80f9e63831b91b298465c28c411871591e7aa/68747470733a2f2f706c61792e676f6f676c652e636f6d2f696e746c2f656e5f67622f6261646765732f696d616765732f67656e657269632f656e5f62616467655f7765625f67656e657269632e706e67"
                      alt="Get it on Google Play"
                      className="h-[60px] md:h-[72px] w-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
                    />
                    
                    {/* Coming Soon Badge - Hidden on mobile */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white hidden md:block">
                      Coming Soon
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 md:mt-3 text-center">
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                    Download our mobile app for a better property browsing experience
                  </p>
                  <p className="text-gray-500 text-xs mt-1 font-medium hidden md:block">
                    Coming Soon
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links and Property Types Container - Side by side on mobile */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3 md:gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-6">Quick Links</h4>
              <ul className="space-y-2 md:space-y-3">
                <li><a href="/buy" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">Buy Property</a></li>
                <li><a href="/rent" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">Rent Property</a></li>
                <li><a href="/commercial" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">Commercial Space</a></li>
                <li><a href="/pg-hostels" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">PG & Hostels</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">About Us</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">Contact</a></li>
              </ul>
            </div>

            {/* Property Types */}
            <div>
              <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-6">Property Types</h4>
              <ul className="space-y-2 md:space-y-3">
                <li><a href="/buy" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">Houses for Sale</a></li>
                <li><a href="/buy" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">Flats for Sale</a></li>
                <li><a href="/land" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">Land for Sale</a></li>
                <li><a href="/rent" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">Houses for Rent</a></li>
                <li><a href="/rent" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">Flats for Rent</a></li>
                <li><a href="/commercial" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm md:text-base">Office Spaces</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-6">Contact Info</h4>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Phone className="w-3 h-3 md:w-4 md:h-4" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm md:text-base">+91 89858 16481</p>
                  <p className="text-gray-400 text-xs md:text-sm">Mon-Sat 9AM-7PM</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Mail className="w-3 h-3 md:w-4 md:h-4" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm md:text-base">mananivasam@gmail.com</p>
                  <p className="text-gray-400 text-xs md:text-sm">24/7 Support</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 md:space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white/10 rounded-full flex items-center justify-center mt-1">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm md:text-base">Vishnayalam street, jagannaickpur, <br />Kakinada</p>
                  <p className="text-gray-300 text-sm md:text-base">Kakinada District, Andhra Pradesh</p>
                  <p className="text-gray-400 text-xs md:text-sm">533005, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 md:py-6 md:pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-0">
              © 2025 Mana Nivasam. All rights reserved.
            </p>
            <div className="flex space-x-4 md:space-x-6 text-xs md:text-sm">
              <a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

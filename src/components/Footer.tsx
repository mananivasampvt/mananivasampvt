
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
                <a 
                  href="https://play.google.com/store/apps/details?id=co.median.android.mpynbb&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition-all duration-300 hover:scale-105 hover:shadow-lg select-none"
                  style={{ minHeight: '48px', minWidth: '48px' }}
                >
                  {/* Official Google Play Badge */}
                  <div className="relative">
                    <img 
                      src="https://camo.githubusercontent.com/899b11c87da7fe33fedafd4a4cf80f9e63831b91b298465c28c411871591e7aa/68747470733a2f2f706c61792e676f6f676c652e636f6d2f696e746c2f656e5f67622f6261646765732f696d616765732f67656e657269632f656e5f62616467655f7765625f67656e657269632e706e67"
                      alt="Get it on Google Play"
                      className="h-[60px] md:h-[72px] w-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                </a>
                
                <div className="mt-2 md:mt-3 text-center">
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                    Download our mobile app for a better property browsing experience
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
                  <p className="text-gray-300 text-sm md:text-base">+91 98498 34102</p>
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

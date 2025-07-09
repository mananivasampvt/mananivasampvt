
import React from 'react';
import { Home, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-premium-gradient rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Mana Nivasam</h3>
                <p className="text-sm text-gray-400">Premium Properties</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6">
              Your trusted partner in finding the perfect property. We specialize in luxury real estate 
              with a commitment to excellence and personalized service.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Buy Property</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Rent Property</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Commercial Space</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">PG & Hostels</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Contact</a></li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Property Types</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Houses for Sale</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Flats for Sale</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Land for Sale</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Houses for Rent</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Flats for Rent</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Office Spaces</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-300">+91 91210 55512</p>
                  <p className="text-gray-400 text-sm">Mon-Sat 9AM-7PM</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-300">info@mana-nivasam.com</p>
                  <p className="text-gray-400 text-sm">24/7 Support</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mt-1">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-300">123 Business District</p>
                  <p className="text-gray-300">Hyderabad, Telangana</p>
                  <p className="text-gray-400 text-sm">500032, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Mana Nivasam. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
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

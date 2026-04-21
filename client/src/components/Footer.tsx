import React from 'react';
import { Instagram, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const businessName = import.meta.env.VITE_BUSINESS_NAME || 'Willowbrook Clothing';
  const instagramUrl = import.meta.env.VITE_INSTAGRAM_PROFILE_URL || 'https://www.instagram.com/willowbrook_kids/';
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@willowbrook.com';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || '919074732100';
  
  const instagramHandle = instagramUrl.split('/').filter(Boolean).pop() || 'willowbrook_kids';

  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <img 
                src="/assets/images/willowbrook-logo.jpeg" 
                alt={businessName} 
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-bold">{businessName}</h3>
                <p className="text-gray-400 text-sm">Your comforatble clothing store</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4 max-w-md">
              Creating beautiful, personalized clothing with premium quality materials. 
              Designed for comfort, style, and lasting memories.
            </p>
            <div className="flex items-center space-x-6">
              <a 
                href={instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-pink-400 transition-colors"
              >
                <Instagram size={20} />
                <span className="text-sm">@{instagramHandle}</span>
              </a>
              <a 
                href={`https://wa.me/${whatsappNumber}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors"
              >
                <MessageCircle size={20} />
                <span className="text-sm">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/brand-story" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition-colors text-sm">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              {/* <li className="flex items-center space-x-2 text-gray-400 text-sm">
                <Mail size={16} />
                <a href={`mailto:${adminEmail}`} className="hover:text-white transition-colors">
                  {adminEmail}
                </a>
              </li> */}
              <li className="flex items-center space-x-2 text-gray-400 text-sm">
                <MessageCircle size={16} />
                <a 
                  href={`https://wa.me/${whatsappNumber}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-green-400 transition-colors"
                >
                  +{whatsappNumber.slice(0, 2)} {whatsappNumber.slice(2, 7)} {whatsappNumber.slice(7)}
                </a>
              </li>
              <li className="flex items-start space-x-2 text-gray-400 text-sm">
                <MapPin size={16} className="mt-0.5" />
                <span>Trivandrum, Kerala<br />India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, ShieldCheck, Truck, Clock, Sparkles, Phone, Mail, MapPin } from 'lucide-react';
import { useStoreSettingsStore } from '../../stores/storeSettingsStore';

export const Footer: React.FC = () => {
  const getSetting = useStoreSettingsStore((state) => state.getSetting);

  const storeName = getSetting('STORE_NAME', 'Skincare Bangladesh');
  const supportEmail = getSetting('SUPPORT_EMAIL', 'support@skincare.com.bd');
  const supportPhone = getSetting('SUPPORT_PHONE', '+880 1711-223344');
  const storeAddress = getSetting('STORE_ADDRESS', 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh');
  const facebookUrl = getSetting('FACEBOOK_URL', 'https://facebook.com/skincarebd');
  const instagramUrl = getSetting('INSTAGRAM_URL', 'https://instagram.com/skincarebd');
  const tagline = getSetting('FOOTER_TAGLINE', 'Your trusted source for authentic skincare products in Bangladesh. 100% genuine formulations from global dermatology brands.');

  return (
    <footer className="bg-cream-100 border-t border-cream-300/80 pt-16 pb-12 mt-20 text-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-cream-300">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif italic text-3xl font-bold text-brand-800 tracking-tight">
                {storeName}
              </span>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              {tagline}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-800">
              <ShieldCheck size={16} /> 100% Genuine Guaranteed
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-charcoal-800 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-brand-800 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-600 hover:text-brand-800 transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/skin-guide" className="text-gray-600 hover:text-brand-800 transition-colors">
                  Skin Guide & Quiz
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-gray-600 hover:text-brand-800 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-brand-800 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-brand-800 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-charcoal-800 mb-4">
              Customer Service
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/account" className="text-gray-600 hover:text-brand-800 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-600 hover:text-brand-800 transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-brand-800 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-brand-800 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-brand-800 transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-charcoal-800 mb-4">
              Contact Channels
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium text-charcoal-800">Email:</span>{' '}
                <a href={`mailto:${supportEmail}`} className="hover:text-brand-800">
                  {supportEmail}
                </a>
              </p>
              <p>
                <span className="font-medium text-charcoal-800">Phone:</span>{' '}
                <a href={`tel:${supportPhone}`} className="hover:text-brand-800">
                  {supportPhone}
                </a>
              </p>
              <p>
                <span className="font-medium text-charcoal-800">Location:</span>{' '}
                {storeAddress}
              </p>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#3b5998] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#E1306C] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright and payment methods */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="font-medium text-charcoal-800">Accepted in BD:</span>
            <span className="bg-white px-2 py-1 rounded border border-gray-200 font-semibold text-emerald-800">Cash on Delivery</span>
            <span className="bg-white px-2 py-1 rounded border border-gray-200 font-semibold text-pink-700">bKash</span>
            <span className="bg-white px-2 py-1 rounded border border-gray-200 font-semibold text-blue-700">SSLCommerz</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

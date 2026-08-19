import React, { useState } from 'react';
import { ShieldCheck, Truck, Phone, Mail, MapPin, CheckCircle2, Clock, HelpCircle } from 'lucide-react';

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-charcoal-800">
    <div className="text-center space-y-2">
      <span className="text-xs font-bold uppercase tracking-widest text-brand-800 bg-brand-50 px-3 py-1 rounded-full">
        Our Story & Mission
      </span>
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
        Original Skincare for Real Skin
      </h1>
    </div>

    <div className="bg-white rounded-3xl border border-cream-300 p-8 space-y-6 text-sm leading-relaxed text-gray-600 shadow-sm">
      <p>
        Founded in Dhaka, Bangladesh, <strong className="text-charcoal-900">Skincare</strong> was created with a single uncompromising mission: to eliminate counterfeit cosmetics and provide 100% authentic, dermatologist-formulated skincare solutions for Bangladesh diverse skin types.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-cream-300">
        <div className="p-4 bg-cream-50 rounded-2xl text-center space-y-1">
          <ShieldCheck className="text-brand-800 mx-auto" size={24} />
          <h4 className="font-bold text-charcoal-900 text-xs">Direct Brand Imports</h4>
          <p className="text-[11px] text-gray-500">Zero middlemen or unverified third parties</p>
        </div>
        <div className="p-4 bg-cream-50 rounded-2xl text-center space-y-1">
          <Clock className="text-brand-800 mx-auto" size={24} />
          <h4 className="font-bold text-charcoal-900 text-xs">Temperature Regulated</h4>
          <p className="text-[11px] text-gray-500">Stored properly to preserve active ingredients</p>
        </div>
        <div className="p-4 bg-cream-50 rounded-2xl text-center space-y-1">
          <Truck className="text-brand-800 mx-auto" size={24} />
          <h4 className="font-bold text-charcoal-900 text-xs">Fast Nationwide COD</h4>
          <p className="text-[11px] text-gray-500">Deliveries across all 64 districts in Bangladesh</p>
        </div>
      </div>
    </div>
  </div>
);

export const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Contact & Support
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Our skincare customer specialists are available 7 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 bg-brand-900 text-white rounded-3xl p-8 space-y-6 shadow-xl">
          <h3 className="font-serif text-xl font-bold">Get in Touch</h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Phone size={16} className="text-brand-300 mt-0.5" />
              <div>
                <p className="font-bold">Hotline (9 AM - 10 PM)</p>
                <p className="text-gray-300">+880 123 456 7890</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={16} className="text-brand-300 mt-0.5" />
              <div>
                <p className="font-bold">Official Email</p>
                <p className="text-gray-300">info@skincarestars.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-brand-300 mt-0.5" />
              <div>
                <p className="font-bold">Fulfillment Center</p>
                <p className="text-gray-300">Road 11, Block D, Gulshan-2, Dhaka-1212</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white rounded-3xl border border-cream-300 p-8 shadow-sm">
          {sent ? (
            <div className="py-12 text-center text-emerald-800 space-y-2">
              <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
              <h4 className="font-bold text-base">Message Sent!</h4>
              <p className="text-xs text-gray-500">We will respond within 2 hours.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Your Name</label>
                <input type="text" required placeholder="Ayesha Rahman" className="w-full p-2.5 bg-cream-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email or Phone</label>
                <input type="text" required placeholder="01712345678" className="w-full p-2.5 bg-cream-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Message / Question</label>
                <textarea required rows={4} placeholder="How can we help with your skincare routine or order?" className="w-full p-2.5 bg-cream-50 border rounded-xl" />
              </div>
              <button type="submit" className="w-full py-3 bg-brand-800 text-white rounded-xl font-semibold hover:bg-brand-900">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
    <div className="text-center space-y-2">
      <h1 className="font-serif text-3xl font-bold text-charcoal-900">Frequently Asked Questions</h1>
      <p className="text-xs text-gray-500">Common questions about authenticity, delivery, and payments.</p>
    </div>

    <div className="space-y-4 text-xs">
      {[
        { q: 'How do you guarantee 100% authenticity?', a: 'All products are directly imported from authorized manufacturers in the USA, Canada, Korea, and France with verifiable batch codes and protective seals.' },
        { q: 'What are your delivery charges in Bangladesh?', a: 'Standard delivery inside Dhaka City is ৳60 (Free on orders over ৳2,500). Outside Dhaka across all 64 districts is ৳120.' },
        { q: 'Can I inspect my package with Cash on Delivery?', a: 'Yes! Our courier partners allow you to check the outer package and authenticity seal before completing the cash payment.' },
        { q: 'How does the Skin Guide quiz work?', a: 'Our diagnostic quiz analyzes your oil levels, sensitivity, and top concerns (such as acne or dark spots) to recommend compatible morning and night routines.' },
      ].map((item, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-cream-300 p-5 shadow-sm space-y-2">
          <h4 className="font-bold text-sm text-charcoal-900 flex items-center gap-2">
            <HelpCircle size={16} className="text-brand-800" /> {item.q}
          </h4>
          <p className="text-gray-600 leading-relaxed pl-6">{item.a}</p>
        </div>
      ))}
    </div>
  </div>
);

export const ShippingPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-xs text-gray-600 leading-relaxed">
    <h1 className="font-serif text-3xl font-bold text-charcoal-900">Shipping & Returns Policy</h1>
    <div className="bg-white rounded-3xl border border-cream-300 p-8 space-y-4 shadow-sm">
      <h3 className="font-bold text-sm text-charcoal-900">1. Delivery Timeline</h3>
      <p>Inside Dhaka: Delivered within 24 to 48 hours. Outside Dhaka: Delivered within 3 to 5 business days via Steadfast, Pathao, or RedX.</p>

      <h3 className="font-bold text-sm text-charcoal-900 pt-2">2. Free Delivery Threshold</h3>
      <p>Orders totaling ৳2,500 or more qualify automatically for complimentary standard delivery across Bangladesh.</p>

      <h3 className="font-bold text-sm text-charcoal-900 pt-2">3. 7-Day Return Guarantee</h3>
      <p>If you receive a damaged or incorrect product, contact us within 7 days of delivery for an instant replacement or refund.</p>
    </div>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-xs text-gray-600 leading-relaxed">
    <h1 className="font-serif text-3xl font-bold text-charcoal-900">Terms & Conditions</h1>
    <div className="bg-white rounded-3xl border border-cream-300 p-8 space-y-4 shadow-sm">
      <p>Welcome to Skincare Bangladesh. By browsing and purchasing on our platform, you agree to our terms of service, warranty conditions, and genuine product usage guidelines.</p>
      <p>All prices are quoted in Bangladeshi Taka (৳ BDT) inclusive of applicable local charges.</p>
    </div>
  </div>
);

import React, { useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Sliders, Save, CheckCircle2 } from 'lucide-react';

export const AdminCMS: React.FC = () => {
  const [heroHeading, setHeroHeading] = useState('Original Skincare for Real Skin');
  const [heroSubtitle, setHeroSubtitle] = useState('Trusted brands. 100% authentic.');
  const [heroImageUrl, setHeroImageUrl] = useState('https://images.unsplash.com/photo-1576426863848-c21f53c60b19?q=80&w=1400');
  const [saved, setSaved] = useState(false);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.updateCMSSection('hero', {
        title: heroHeading,
        subtitle: heroSubtitle,
        imageUrl: heroImageUrl,
        buttonText: 'Shop Men,Shop Women',
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to update CMS section');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Homepage CMS Manager</h1>
        <p className="text-xs text-slate-400 mt-1">
          Dynamically manage the storefront hero banner, titles, and promotional announcements without changing code.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-950 border border-emerald-800 text-xs font-semibold text-emerald-300 rounded-xl flex items-center gap-1.5">
          <CheckCircle2 size={16} /> Homepage content updated successfully!
        </div>
      )}

      {/* Hero Section Config */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Sliders size={16} className="text-emerald-400" /> Hero Section Settings
        </h3>

        <form onSubmit={handleSaveHero} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Main Heading</label>
            <input
              type="text"
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Supporting Subtitle</label>
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Hero Lifestyle Image URL</label>
            <input
              type="url"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow"
          >
            <Save size={14} /> Update Hero Content
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { orderService } from '../../services/order.service';
import { Sliders, Save, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const AdminCMS: React.FC = () => {
  const queryClient = useQueryClient();
  const [heroHeading, setHeroHeading] = useState('Original Skincare for Real Skin');
  const [heroSubtitle, setHeroSubtitle] = useState('Trusted brands. 100% authentic.');
  const [heroImageUrl, setHeroImageUrl] = useState('https://images.unsplash.com/photo-1576426863848-c21f53c60b19?q=80&w=1400');
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    orderService.getHomepageCMS().then((sections) => {
      const hero = sections.find((s: any) => s.sectionKey === 'hero');
      if (hero) {
        if (hero.title) setHeroHeading(hero.title);
        if (hero.subtitle) setHeroSubtitle(hero.subtitle);
        if (hero.imageUrl) setHeroImageUrl(hero.imageUrl);
      }
    }).catch(() => {});
  }, []);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.updateCMSSection('hero', {
        title: heroHeading,
        subtitle: heroSubtitle,
        imageUrl: heroImageUrl,
        buttonText: 'Shop Men,Shop Women',
      });
      queryClient.invalidateQueries({ queryKey: ['homepage-cms'] });
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

          <div className="space-y-2">
            <label className="block text-slate-400 font-semibold">Hero Banner Image (Upload or URL)</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://... or upload image"
                className="flex-1 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
              />
              <label className={`px-4 py-2.5 ${isUploading ? 'bg-slate-700 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 cursor-pointer'} text-slate-200 rounded-xl font-semibold flex items-center gap-1.5 shrink-0 transition-colors`}>
                <ImageIcon size={14} className={isUploading ? 'animate-pulse' : ''} />
                <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsUploading(true);
                      try {
                        const res = await adminService.uploadImage(file, 'skincare-cms');
                        if (res?.url) {
                          setHeroImageUrl(res.url);
                        }
                      } catch (err: any) {
                        alert(err.message || 'Image upload failed');
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                />
              </label>
            </div>
            {heroImageUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 max-w-sm">
                <img src={heroImageUrl} alt="Hero Banner Preview" className="w-full h-36 object-cover" />
              </div>
            )}
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


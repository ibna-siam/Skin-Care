import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  Layout,
  Save,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Link as LinkIcon,
  HelpCircle,
} from 'lucide-react';

const DEFAULT_SECTIONS = [
  {
    sectionKey: 'hero',
    name: 'Hero Banner Carousel',
    defaultTitle: 'Dermatologist-Approved Skincare for Bangladesh',
    defaultSubtitle: 'Tailored routines for your unique skin barrier and tropical climate.',
    hasButton: true,
  },
  {
    sectionKey: 'category_cards',
    name: 'Featured Categories Grid',
    defaultTitle: 'Shop by Skincare Category',
    defaultSubtitle: 'Explore cleansers, hydrating serums, moisturizers, and broad-spectrum sunscreens.',
    hasButton: false,
  },
  {
    sectionKey: 'best_sellers',
    name: 'Best Sellers Showcase',
    defaultTitle: 'Top Rated Best Sellers',
    defaultSubtitle: 'Most-loved skincare essentials verified by over 10,000+ happy customers.',
    hasButton: true,
  },
  {
    sectionKey: 'skin_quiz_banner',
    name: 'AI Skin Routine Finder Banner',
    defaultTitle: 'Not Sure Where to Begin? Take our 2-Minute Skin Quiz',
    defaultSubtitle: 'Get a personalized morning & night regimen crafted by cosmetic dermatologists.',
    hasButton: true,
  },
  {
    sectionKey: 'customer_reviews',
    name: 'Customer Testimonials & Proof',
    defaultTitle: 'Loved by Real Skincare Enthusiasts',
    defaultSubtitle: 'Verified feedback from customers across Dhaka, Chittagong, and Sylhet.',
    hasButton: false,
  },
  {
    sectionKey: 'newsletter',
    name: 'Newsletter & Promo Signup',
    defaultTitle: 'Get 10% Off Your First Order',
    defaultSubtitle: 'Subscribe for exclusive skincare drop alerts, skincare advice, and member-only gifts.',
    hasButton: true,
  },
];

export const AdminCMS: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('hero');
  const [savedSuccessKey, setSavedSuccessKey] = useState<string | null>(null);

  // Form State for active section
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Fetch sections from database
  const { data: dbSections = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-cms-sections'],
    queryFn: () => adminService.getCMSSections(),
  });

  // Merge DB sections with defaults
  const sectionsMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    DEFAULT_SECTIONS.forEach((def) => {
      const found = dbSections.find((s: any) => s.sectionKey === def.sectionKey);
      map[def.sectionKey] = {
        sectionKey: def.sectionKey,
        name: def.name,
        title: found?.title || def.defaultTitle,
        subtitle: found?.subtitle || def.defaultSubtitle,
        content: found?.content || '',
        imageUrl: found?.imageUrl || '',
        linkUrl: found?.linkUrl || '/products',
        buttonText: found?.buttonText || 'Explore Now',
        isActive: found?.isActive !== false,
        hasButton: def.hasButton,
      };
    });
    return map;
  }, [dbSections]);

  // Sync active section to local form state on tab switch
  React.useEffect(() => {
    if (sectionsMap[activeTab]) {
      setFormData(sectionsMap[activeTab]);
    }
  }, [activeTab, sectionsMap]);

  // Update Section Mutation
  const saveMutation = useMutation({
    mutationFn: ({ sectionKey, data }: { sectionKey: string; data: any }) =>
      adminService.updateCMSSection(sectionKey, data),
    onSuccess: (_, variables) => {
      setSavedSuccessKey(variables.sectionKey);
      setTimeout(() => setSavedSuccessKey(null), 2500);
      queryClient.invalidateQueries({ queryKey: ['admin-cms-sections'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-cms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      queryClient.invalidateQueries({ queryKey: ['public-media-slots'] });
    },
  });

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ sectionKey: activeTab, data: formData });
  };

  const currentSection = DEFAULT_SECTIONS.find((s) => s.sectionKey === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Layout size={24} className="text-emerald-400" />
            Homepage CMS & Content Configurator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize storefront copy, call-to-actions, marketing banners, and section visibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh CMS"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar list + Active Editor Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sections Navigation List */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-1.5 h-fit">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3 py-2 block">
            Homepage Sections
          </span>

          {DEFAULT_SECTIONS.map((sec) => {
            const isActiveTab = activeTab === sec.sectionKey;
            const currentData = sectionsMap[sec.sectionKey];
            const isLive = currentData?.isActive !== false;

            return (
              <button
                key={sec.sectionKey}
                onClick={() => setActiveTab(sec.sectionKey)}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between ${
                  isActiveTab
                    ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold">{sec.name}</p>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    key: {sec.sectionKey}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isLive ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                    title={isLive ? 'Section is Live' : 'Section is Hidden'}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Section Editor Form */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-100 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">{currentSection?.name}</h2>
              <span className="text-xs text-slate-400 font-mono">sectionKey: {activeTab}</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={formData.isActive !== false}
                  onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-300">
                  {formData.isActive !== false ? 'Live on Store' : 'Hidden'}
                </span>
              </label>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Section Headline */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Main Headline Title *
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 text-sm font-semibold"
              />
            </div>

            {/* Subtitle / Description */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Subtitle / Supportive Copy
              </label>
              <textarea
                rows={2}
                value={formData.subtitle || ''}
                onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3.5 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* CTA Button Settings (if applicable) */}
            {currentSection?.hasButton && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText || ''}
                    onChange={(e) => handleFieldChange('buttonText', e.target.value)}
                    placeholder="e.g. Shop Best Sellers"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Destination URL / Path
                  </label>
                  <input
                    type="text"
                    value={formData.linkUrl || ''}
                    onChange={(e) => handleFieldChange('linkUrl', e.target.value)}
                    placeholder="e.g. /products?sort=best_selling"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Image / Graphic URL */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Background / Promotional Graphic URL
              </label>
              <input
                type="text"
                value={formData.imageUrl || ''}
                onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                placeholder="https://images.unsplash.com/... or Cloudinary URL"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
              />
              {formData.imageUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 h-28 w-full max-w-sm bg-slate-950">
                  <img
                    src={formData.imageUrl}
                    alt="Section banner preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
                  savedSuccessKey === activeTab
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50'
                }`}
              >
                {savedSuccessKey === activeTab ? (
                  <>
                    <Check size={14} />
                    <span>Saved to Storefront</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>{saveMutation.isPending ? 'Publishing...' : 'Publish Section Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

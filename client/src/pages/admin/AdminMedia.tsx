import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Grid,
  List,
  Copy,
  Check,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Layers,
  FileImage,
  AlertCircle,
  Eye,
  CheckCircle2,
  Plus,
} from 'lucide-react';

const SAMPLE_PRESETS = [
  { label: 'Hero Banner', url: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?q=80&w=1600&auto=format&fit=crop', alt: 'Authentic Dermatological Skincare' },
  { label: 'Men Skincare', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop', alt: 'Men Skincare & Grooming' },
  { label: 'Women Care', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', alt: 'Women Gentle Skin Barrier' },
  { label: 'Skin Guide', url: 'https://images.unsplash.com/photo-1608248597359-00976156e520?q=80&w=600&auto=format&fit=crop', alt: 'Personalized Skin Routine Guide' },
  { label: 'Sun Protection', url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1600&auto=format&fit=crop', alt: 'UVA/UVB Broad Spectrum Protection' },
  { label: 'Serum Glow', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop', alt: 'Korean Glass Skin Serums' },
];

export const AdminMedia: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'slots' | 'library'>('slots');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [replaceModalSlot, setReplaceModalSlot] = useState<any | null>(null);
  const [replaceUrl, setReplaceUrl] = useState('');
  const [replaceAlt, setReplaceAlt] = useState('');
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreview, setReplacePreview] = useState<string | null>(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSection, setUploadSection] = useState('HOMEPAGE');
  const [uploadSlot, setUploadSlot] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const [deleteCandidate, setDeleteCandidate] = useState<any | null>(null);
  const [editModalAsset, setEditModalAsset] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAlt, setEditAlt] = useState('');

  // Fetch Media Assets & Slot Registry
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-media', selectedSection, searchTerm],
    queryFn: () =>
      adminService.getMediaAssets({
        section: selectedSection,
        search: searchTerm,
      }),
  });

  const assets: any[] = data?.assets || [];
  const slotsRegistry: Record<string, any> = data?.slots || {};

  // Slot Image Replacement Mutation
  const replaceMutation = useMutation({
    mutationFn: (variables: { slot: string; data: any }) =>
      adminService.replaceSlotImage(variables.slot, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      queryClient.invalidateQueries({ queryKey: ['public-media-slots'] });
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cms-sections'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-cms'] });
      setReplaceModalSlot(null);
      setReplaceFile(null);
      setReplacePreview(null);
      setReplaceUrl('');
      setReplaceAlt('');
    },
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: (variables: { file: File; metadata: any }) =>
      adminService.uploadMediaAsset(variables.file, variables.metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      queryClient.invalidateQueries({ queryKey: ['public-media-slots'] });
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cms-sections'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-cms'] });
      setUploadModalOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadTitle('');
      setUploadAlt('');
      setUploadSlot('');
    },
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: (variables: { id: string; data: any }) =>
      adminService.updateMediaAsset(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      queryClient.invalidateQueries({ queryKey: ['public-media-slots'] });
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cms-sections'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-cms'] });
      setEditModalAsset(null);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (variables: { id: string; force?: boolean }) =>
      adminService.deleteMediaAsset(variables.id, variables.force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      setDeleteCandidate(null);
    },
  });

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openReplaceModal = (slotKey: string, slotMeta: any) => {
    const activeAsset = assets.find((a) => a.slot === slotKey);
    setReplaceModalSlot({ key: slotKey, ...slotMeta });
    setReplaceUrl(activeAsset?.url || slotMeta.defaultUrl);
    setReplaceAlt(activeAsset?.altText || slotMeta.defaultAlt);
    setReplacePreview(activeAsset?.url || slotMeta.defaultUrl);
    setReplaceFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isReplace: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isReplace) {
      setReplaceFile(file);
      setReplacePreview(URL.createObjectURL(file));
    } else {
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      if (!uploadAlt) setUploadAlt(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ImageIcon size={20} />
            </span>
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
              Website Image &amp; Media Management
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Replace and manage live storefront images without touching source code.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Refresh Media"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-colors"
          >
            <Upload size={16} />
            <span>Upload New Image</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('slots')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'slots'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers size={15} />
          <span>Website Slots (Storefront Images)</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'library'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileImage size={15} />
          <span>Media Library ({assets.length})</span>
        </button>
      </div>

      {/* TAB 1: WEBSITE IMAGE SLOTS */}
      {activeTab === 'slots' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-blue-400 text-xs">
            <Sparkles size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-300">Live Zero-Code Website Image Slots:</span>
              <p className="mt-0.5 text-blue-400/90 leading-relaxed">
                Click <strong>"Replace Image"</strong> on any slot below. You can upload a new photo or enter an image URL with custom alt text. The storefront automatically uses the updated image immediately without deploying code.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(slotsRegistry).map(([slotKey, slotMeta]: [string, any]) => {
              const activeAsset = assets.find((a) => a.slot === slotKey);
              const currentUrl = activeAsset?.url || slotMeta.defaultUrl;
              const currentAlt = activeAsset?.altText || slotMeta.defaultAlt;
              const isCustom = !!activeAsset;

              return (
                <div
                  key={slotKey}
                  className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between group hover:border-slate-700 transition-all"
                >
                  {/* Card Media Preview */}
                  <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden border-b border-slate-800">
                    <img
                      src={currentUrl}
                      alt={currentAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-[10px] font-mono font-semibold text-slate-300 border border-slate-700">
                        {slotMeta.dimensions}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      {isCustom ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-[10px] font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          <span>Custom Live</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-800/90 backdrop-blur-md text-[10px] font-semibold text-slate-400 border border-slate-700">
                          Default System
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-1">
                        {slotMeta.section} &bull; {slotKey}
                      </div>
                      <h3 className="font-serif font-bold text-white text-base leading-snug">
                        {slotMeta.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                        <span className="font-semibold text-slate-300">Alt Text:</span> "{currentAlt}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleCopy(currentUrl, slotKey)}
                        className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono border border-slate-800 flex items-center gap-1.5 transition-colors"
                        title="Copy Image URL"
                      >
                        {copiedId === slotKey ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copiedId === slotKey ? 'Copied' : 'URL'}</span>
                      </button>

                      <button
                        onClick={() => openReplaceModal(slotKey, slotMeta)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                      >
                        <Upload size={13} />
                        <span>Replace Image</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MEDIA LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search media by name, slot, alt text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Sections</option>
                <option value="HOMEPAGE">Homepage</option>
                <option value="PRODUCTS">Products</option>
                <option value="BRANDS">Brands</option>
                <option value="CATEGORIES">Categories</option>
                <option value="BANNERS">Banners</option>
                <option value="SKIN_GUIDE">Skin Guide</option>
                <option value="GENERAL">General</option>
              </select>

              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}
                >
                  <Grid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Grid Mode */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg group hover:border-slate-700 flex flex-col justify-between"
                >
                  <div className="relative aspect-square bg-slate-950 overflow-hidden">
                    <img
                      src={asset.url}
                      alt={asset.altText || asset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {asset.slot && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[9px] font-bold">
                          In Use
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleCopy(asset.url, asset.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                        title="Copy URL"
                      >
                        {copiedId === asset.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>

                      <button
                        onClick={() => {
                          setEditModalAsset(asset);
                          setEditTitle(asset.title || '');
                          setEditAlt(asset.altText || '');
                        }}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                        title="Edit Details"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button
                        onClick={() => setDeleteCandidate(asset)}
                        className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 text-left">
                    <p className="text-xs font-semibold text-slate-200 truncate">{asset.title || 'Untitled Asset'}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {asset.slot ? `Slot: ${asset.slot}` : asset.section}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List Mode */}
          {viewMode === 'list' && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Preview</th>
                    <th className="py-3 px-4">Name / Title</th>
                    <th className="py-3 px-4">Section / Slot</th>
                    <th className="py-3 px-4">Alt Text</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={asset.url}
                          alt={asset.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                        />
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {asset.title}
                        {asset.fileType && <span className="block text-[10px] text-slate-500 font-mono">{asset.fileType}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[10px] border border-slate-800">
                          {asset.slot || asset.section}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{asset.altText || '—'}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(asset.url, asset.id)}
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400"
                            title="Copy URL"
                          >
                            {copiedId === asset.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                          <button
                            onClick={() => {
                              setEditModalAsset(asset);
                              setEditTitle(asset.title || '');
                              setEditAlt(asset.altText || '');
                            }}
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400"
                            title="Edit"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(asset)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: REPLACE SLOT IMAGE */}
      {replaceModalSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-white">
                  Replace Website Slot: {replaceModalSlot.title}
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 uppercase">
                  Slot Key: {replaceModalSlot.key}
                </span>
              </div>
              <button
                onClick={() => setReplaceModalSlot(null)}
                className="text-slate-500 hover:text-slate-300 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {/* Live Image Preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Image Preview</label>
              <div className="aspect-[16/9] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative">
                {replacePreview ? (
                  <img src={replacePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-slate-600">No Image Preview</span>
                )}
              </div>
            </div>

            {/* File Upload / Drag-Drop */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Upload New Image File (JPG, PNG, WebP)
              </label>
              <label className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50">
                <Upload size={20} className="text-emerald-400 mb-1" />
                <span className="text-xs text-slate-300 font-medium">
                  {replaceFile ? replaceFile.name : 'Click to browse image file'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Max size: 8MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, true)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Or Image URL */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Or Image URL
              </label>
              <input
                type="text"
                value={replaceUrl}
                onChange={(e) => {
                  setReplaceUrl(e.target.value);
                  setReplacePreview(e.target.value);
                  setReplaceFile(null);
                }}
                placeholder="https://images.unsplash.com/... or Cloudinary URL"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick Sample Presets */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Quick Sample Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PRESETS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setReplaceUrl(s.url);
                      setReplaceAlt(s.alt);
                      setReplacePreview(s.url);
                      setReplaceFile(null);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-emerald-400 font-mono transition-colors"
                  >
                    + {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alt Text (Editable with Zero Code Edits) */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Editable Alt Text (Accessibility &amp; SEO)
              </label>
              <input
                type="text"
                value={replaceAlt}
                onChange={(e) => setReplaceAlt(e.target.value)}
                placeholder="Descriptive alt text for accessibility"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReplaceModalSlot(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={replaceMutation.isPending || (!replaceFile && !replaceUrl)}
                onClick={() => {
                  replaceMutation.mutate({
                    slot: replaceModalSlot.key,
                    data: {
                      file: replaceFile || undefined,
                      url: replaceUrl || undefined,
                      altText: replaceAlt,
                      title: replaceModalSlot.title,
                      section: replaceModalSlot.section,
                    },
                  });
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/40 disabled:opacity-50"
              >
                {replaceMutation.isPending ? 'Applying Update...' : 'Save & Publish Live'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD GENERAL ASSET */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-serif font-bold text-white">Upload New Media Asset</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50">
                {uploadPreview ? (
                  <img src={uploadPreview} alt="Preview" className="h-32 object-contain rounded-xl mb-2" />
                ) : (
                  <Upload size={28} className="text-emerald-400 mb-2" />
                )}
                <span className="text-xs text-slate-300 font-medium">
                  {uploadFile ? uploadFile.name : 'Select or drop image file'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WebP, SVG up to 8MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, false)}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Asset Title</label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Summer Campaign Banner"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Section</label>
                <select
                  value={uploadSection}
                  onChange={(e) => setUploadSection(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="HOMEPAGE">Homepage</option>
                  <option value="PRODUCTS">Products</option>
                  <option value="BRANDS">Brands</option>
                  <option value="CATEGORIES">Categories</option>
                  <option value="BANNERS">Banners</option>
                  <option value="SKIN_GUIDE">Skin Guide</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Assign Slot (Optional)</label>
                <input
                  type="text"
                  value={uploadSlot}
                  onChange={(e) => setUploadSlot(e.target.value)}
                  placeholder="e.g. homepage.hero"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Alt Text</label>
              <input
                type="text"
                value={uploadAlt}
                onChange={(e) => setUploadAlt(e.target.value)}
                placeholder="Describe image for SEO and screen readers"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={uploadMutation.isPending || !uploadFile}
                onClick={() => {
                  if (uploadFile) {
                    uploadMutation.mutate({
                      file: uploadFile,
                      metadata: {
                        title: uploadTitle,
                        section: uploadSection,
                        slot: uploadSlot || undefined,
                        altText: uploadAlt,
                      },
                    });
                  }
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/40 disabled:opacity-50"
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Media'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION WITH SAFETY CHECK */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/20 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>

            <h3 className="text-lg font-serif font-bold text-white text-center">
              Confirm Media Deletion
            </h3>

            {deleteCandidate.slot ? (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed">
                <strong>Warning:</strong> This media asset is currently assigned to live website slot{' '}
                <span className="font-mono font-bold text-rose-200">[{deleteCandidate.slot}]</span>. Deleting it directly may cause the website to fallback to the default template image.
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center">
                Are you sure you want to delete <span className="text-slate-200 font-semibold">{deleteCandidate.title}</span>? This action cannot be undone.
              </p>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate({ id: deleteCandidate.id, force: true })}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT METADATA */}
      {editModalAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <h3 className="text-lg font-serif font-bold text-white">Edit Media Metadata</h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Alt Text</label>
              <input
                type="text"
                value={editAlt}
                onChange={(e) => setEditAlt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditModalAsset(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={editMutation.isPending}
                onClick={() =>
                  editMutation.mutate({
                    id: editModalAsset.id,
                    data: { title: editTitle, altText: editAlt },
                  })
                }
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                {editMutation.isPending ? 'Saving...' : 'Save Metadata'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminMedia;

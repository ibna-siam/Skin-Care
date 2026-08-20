import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Trash2,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  Eye,
} from 'lucide-react';

const STATUS_TABS = [
  { key: 'ALL', label: 'All Reviews' },
  { key: 'PENDING', label: 'Pending Moderation' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

export const AdminReviews: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get('status') || 'ALL';

  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Fetch Reviews
  const { data: reviewsData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-reviews', activeStatus, ratingFilter, searchTerm, page, limit],
    queryFn: () =>
      adminService.getReviews({
        page,
        limit,
        status: activeStatus === 'ALL' ? undefined : activeStatus,
        rating: ratingFilter === 'ALL' ? undefined : ratingFilter,
        search: searchTerm || undefined,
      }),
  });

  // Moderation Mutation (Approve / Reject / Feature)
  const moderateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; isFeatured?: boolean } }) =>
      adminService.moderateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  const reviews = reviewsData?.data || [];
  const meta = reviewsData?.meta || (reviewsData as any)?.pagination || {
    total: 0,
    totalPages: 1,
    countsByStatus: {},
  };
  const countsByStatus = meta.countsByStatus || {};

  const handleStatusTabChange = (st: string) => {
    if (st === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', st);
    }
    setSearchParams(searchParams);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Star size={24} className="text-amber-400 fill-amber-400" />
            Verified Reviews Moderation Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Moderate customer feedback, manage homepage spotlight reviews, and verify product experiences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh reviews"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Status Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800/80 custom-scrollbar">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.key;
          const count = tab.key === 'ALL' ? meta.total : countsByStatus[tab.key] ?? 0;

          return (
            <button
              key={tab.key}
              onClick={() => handleStatusTabChange(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search reviewer, product, keywords..."
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950/60 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Rating: All Stars</option>
            <option value="5">5 Stars (★★★★★)</option>
            <option value="4">4 Stars (★★★★☆)</option>
            <option value="3">3 Stars (★★★☆☆)</option>
            <option value="2">2 Stars (★★☆☆☆)</option>
            <option value="1">1 Star (★☆☆☆☆)</option>
          </select>
        </div>
      </div>

      {/* Reviews Moderation Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-3">Reviewer</th>
                <th className="py-3.5 px-3 text-center">Rating</th>
                <th className="py-3.5 px-3">Review Content</th>
                <th className="py-3.5 px-3 text-center">Featured</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pr-4 pl-2 text-right">Moderation Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono">Loading reviews...</p>
                    </div>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 space-y-2">
                    <Star size={28} className="mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-300">No reviews found</p>
                    <p className="text-xs text-slate-400">No reviews match the selected filter criteria.</p>
                  </td>
                </tr>
              ) : (
                reviews.map((r: any) => {
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 truncate max-w-[200px]">
                          {r.product?.images?.[0]?.url ? (
                            <img
                              src={r.product.images[0].url}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover bg-slate-800 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                              <Package size={14} />
                            </div>
                          )}
                          <span className="font-semibold text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                            {r.product?.name || 'Product'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-200">{r.userName}</span>
                          {r.isVerifiedPurchase && (
                            <span title="Verified Purchase">
                              <ShieldCheck size={13} className="text-emerald-400" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{r.rating} / 5</span>
                      </td>

                      <td className="py-3 px-3 max-w-[300px]">
                        <p className="font-semibold text-slate-200 truncate">{r.title}</p>
                        <p className="text-slate-400 line-clamp-2 text-[11px] leading-relaxed">{r.comment}</p>
                        {r.images?.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2">
                            {r.images.map((img: any) => (
                              <img
                                key={img.id}
                                src={img.url}
                                alt="User review attachment"
                                onClick={() => setPreviewImageUrl(img.url)}
                                className="w-8 h-8 rounded-lg object-cover cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all border border-slate-700"
                              />
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() =>
                            moderateMutation.mutate({
                              id: r.id,
                              data: { isFeatured: !r.isFeatured },
                            })
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            r.isFeatured
                              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                          }`}
                          title="Toggle Featured on Homepage"
                        >
                          <Sparkles size={14} className={r.isFeatured ? 'fill-amber-400' : ''} />
                        </button>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono ${
                            r.status === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : r.status === 'REJECTED'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3 pr-4 pl-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status !== 'APPROVED' && (
                            <button
                              onClick={() =>
                                moderateMutation.mutate({ id: r.id, data: { status: 'APPROVED' } })
                              }
                              className="p-1.5 bg-emerald-950/60 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-colors"
                              title="Approve Review"
                            >
                              <Check size={13} />
                            </button>
                          )}

                          {r.status !== 'REJECTED' && (
                            <button
                              onClick={() =>
                                moderateMutation.mutate({ id: r.id, data: { status: 'REJECTED' } })
                              }
                              className="p-1.5 bg-amber-950/60 hover:bg-amber-600 text-amber-400 hover:text-white rounded-lg transition-colors"
                              title="Reject Review"
                            >
                              <X size={13} />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm('Delete this review permanently?')) {
                                deleteMutation.mutate(r.id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-900/60 hover:text-rose-400 text-slate-300 rounded-lg transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-semibold text-slate-200">{Math.min(page * limit, meta.total)}</span> of{' '}
            <span className="font-semibold text-slate-200">{meta.total}</span> reviews
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono px-2">
              Page {page} of {meta.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(meta.totalPages || 1, prev + 1))}
              disabled={page >= meta.totalPages}
              className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in"
        >
          <div className="relative max-w-xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
            <img src={previewImageUrl} alt="Review attachment" className="w-full h-auto object-contain" />
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-3 right-3 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

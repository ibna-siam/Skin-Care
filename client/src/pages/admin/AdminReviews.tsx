import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { Star, Check, X, Sparkles, ShieldCheck } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => adminService.getReviews(),
  });

  const handleModerate = async (id: string, status: string, isFeatured?: boolean) => {
    try {
      await adminService.moderateReview(id, { status, isFeatured });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    } catch (err: any) {
      alert(err.message || 'Failed to moderate review');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Review Moderation</h1>
        <p className="text-xs text-slate-400 mt-1">Approve, reject, or feature verified customer testimonials on the storefront.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <p className="text-xs text-slate-500">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-slate-500">No reviews submitted yet.</p>
        ) : (
          reviews.map((rev: any) => (
            <div key={rev.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-100">{rev.userName}</h4>
                  <p className="text-[11px] text-slate-500">Product: {rev.product?.name || 'Skincare item'}</p>
                </div>
                <div className="flex text-amber-400 gap-0.5">
                  {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                    <Star key={i} size={13} className="fill-current text-amber-400" />
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-200">{rev.title}</p>
                <p className="text-slate-400 mt-1 leading-relaxed">{rev.comment}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  rev.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                }`}>
                  {rev.status} {rev.isFeatured && '• FEATURED'}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleModerate(rev.id, 'APPROVED', !rev.isFeatured)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Sparkles size={12} /> {rev.isFeatured ? 'Unfeature' : 'Feature on Home'}
                  </button>
                  {rev.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleModerate(rev.id, 'APPROVED')}
                      className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Check size={12} /> Approve
                    </button>
                  )}
                  {rev.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleModerate(rev.id, 'REJECTED')}
                      className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-400 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                    >
                      <X size={12} /> Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

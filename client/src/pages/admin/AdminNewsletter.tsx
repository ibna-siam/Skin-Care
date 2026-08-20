import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  Mail,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Send,
  Users,
} from 'lucide-react';

export const AdminNewsletter: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  // Fetch Subscribers
  const { data: subscribersData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-newsletters', page, limit, searchTerm],
    queryFn: () => adminService.getNewsletters({ page, limit, search: searchTerm || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteNewsletter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-newsletters'] });
    },
  });

  const subscribers = subscribersData?.data || [];
  const meta = subscribersData?.meta || { total: subscribers.length, totalPages: 1 };

  const handleExportCSV = () => {
    window.open(`${import.meta.env.VITE_API_URL || '/api'}/admin/newsletters/export/csv`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Mail size={24} className="text-blue-400" />
            Newsletter Subscribers & Audiences
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage subscribed customer emails, export audience lists, and manage marketing communications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Download size={14} />
            <span>Export Subscribers CSV</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh subscribers"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
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
            placeholder="Search subscriber email..."
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Total Subscribers: <strong className="text-slate-200">{meta.total}</strong>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Subscriber Email</th>
                <th className="py-3.5 px-3">Subscription Status</th>
                <th className="py-3.5 px-3">Subscribed Date</th>
                <th className="py-3.5 pr-4 pl-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-400 font-sans">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono">Loading subscribers...</p>
                    </div>
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-400 font-sans space-y-2">
                    <Mail size={28} className="mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-300">No subscribers found</p>
                    <p className="text-xs text-slate-400">Customers subscribing to the newsletter will appear here.</p>
                  </td>
                </tr>
              ) : (
                subscribers.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-200 font-sans font-semibold">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                          <Mail size={13} />
                        </div>
                        <span>{s.email}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 size={10} /> Active Subscriber
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(s.subscribedAt).toLocaleDateString()}{' '}
                      <span className="text-slate-300">{new Date(s.subscribedAt).toLocaleTimeString()}</span>
                    </td>

                    <td className="py-3 pr-4 pl-2 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Unsubscribe and remove ${s.email}?`)) deleteMutation.mutate(s.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Remove Subscriber"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing page <strong className="text-slate-200">{page}</strong> of {meta.totalPages || 1}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="p-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="font-mono text-[11px]">
              {page} / {meta.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(meta.totalPages || 1, prev + 1))}
              disabled={page >= (meta.totalPages || 1)}
              className="p-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

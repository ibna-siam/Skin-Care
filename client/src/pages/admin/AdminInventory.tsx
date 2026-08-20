import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  RefreshCw,
  Plus,
  Minus,
  Save,
  Check,
  Package,
  ArrowUpDown,
  Filter,
  Flame,
} from 'lucide-react';
import { formatBDT } from '@skincare/shared';

type StockFilter = 'ALL' | 'OUT_OF_STOCK' | 'CRITICAL' | 'LOW_STOCK' | 'HEALTHY';

export const AdminInventory: React.FC = () => {
  const queryClient = useQueryClient();
  const [stockLevel, setStockLevel] = useState<StockFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('stock');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Inline editing state: { [productId]: number }
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Fetch products with inventory filter
  const { data: productsData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-inventory', stockLevel, searchTerm, page, limit, sortBy, sortOrder],
    queryFn: () =>
      adminService.getProducts({
        page,
        limit,
        search: searchTerm || undefined,
        stockLevel: stockLevel === 'ALL' ? undefined : stockLevel,
        sortBy,
        sortOrder,
      }),
  });

  // Stock update mutation
  const stockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      adminService.updateProductStock(id, { stock }),
    onSuccess: (_, variables) => {
      setSavedSuccessId(variables.id);
      setTimeout(() => setSavedSuccessId(null), 2000);
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
  });

  const products = productsData?.data || [];
  const meta = productsData?.meta || (productsData as any)?.pagination || {
    total: 0,
    totalPages: 1,
    outOfStockCount: 0,
    lowStockCount: 0,
  };

  const handleStockInputChange = (id: string, val: string) => {
    const parsed = parseInt(val, 10);
    setEditingStock((prev) => ({
      ...prev,
      [id]: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  };

  const handleQuickAdjust = (id: string, currentStock: number, delta: number) => {
    const currentVal = editingStock[id] !== undefined ? editingStock[id] : currentStock;
    const newVal = Math.max(0, currentVal + delta);
    setEditingStock((prev) => ({ ...prev, [id]: newVal }));
  };

  const handleSaveStock = (id: string, currentStock: number) => {
    const newStock = editingStock[id] !== undefined ? editingStock[id] : currentStock;
    stockMutation.mutate({ id, stock: newStock });
  };

  const handleExportCsv = () => {
    adminService.exportProductsCsv();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Boxes size={24} className="text-emerald-400" />
            Inventory Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-SKU stock levels, replenishment watchlist, and batch inventory velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download size={14} />
            <span>Export Inventory CSV</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh inventory"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Out of Stock Card */}
        <button
          onClick={() => {
            setStockLevel('OUT_OF_STOCK');
            setPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            stockLevel === 'OUT_OF_STOCK'
              ? 'bg-rose-950/40 border-rose-600 ring-1 ring-rose-500'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Out of Stock</span>
            <XCircle size={16} className="text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2">{meta.outOfStockCount || 0}</p>
          <span className="text-[11px] text-slate-400">0 units remaining</span>
        </button>

        {/* Critical Stock Card */}
        <button
          onClick={() => {
            setStockLevel('CRITICAL');
            setPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            stockLevel === 'CRITICAL'
              ? 'bg-amber-950/40 border-amber-600 ring-1 ring-amber-500'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Critical Threshold</span>
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{meta.lowStockCount || 0}</p>
          <span className="text-[11px] text-slate-400">1 to 3 units left</span>
        </button>

        {/* Low Stock Card */}
        <button
          onClick={() => {
            setStockLevel('LOW_STOCK');
            setPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            stockLevel === 'LOW_STOCK'
              ? 'bg-blue-950/40 border-blue-600 ring-1 ring-blue-500'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Low Stock Warning</span>
            <Boxes size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-2">Watchlist</p>
          <span className="text-[11px] text-slate-400">4 to 10 units left</span>
        </button>

        {/* Healthy Stock Card */}
        <button
          onClick={() => {
            setStockLevel('ALL');
            setPage(1);
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            stockLevel === 'ALL'
              ? 'bg-emerald-950/40 border-emerald-600 ring-1 ring-emerald-500'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">All Active SKUs</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{meta.total || 0}</p>
          <span className="text-[11px] text-emerald-400">Full catalog inventory</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
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
            placeholder="Search by SKU or product name..."
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={stockLevel}
            onChange={(e) => {
              setStockLevel(e.target.value as StockFilter);
              setPage(1);
            }}
            className="bg-slate-950/60 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            <option value="CRITICAL">Critical (1 - 3)</option>
            <option value="LOW_STOCK">Low Stock (4 - 10)</option>
            <option value="HEALTHY">Healthy (&gt; 10)</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product & SKU</th>
                <th className="py-3.5 px-3">Brand / Category</th>
                <th className="py-3.5 px-3 text-right">Price (BDT)</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3 text-center">Current Stock</th>
                <th className="py-3.5 pr-4 pl-3 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono">Loading inventory metrics...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 space-y-2">
                    <Boxes size={28} className="mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-300">No products found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filter or search terms.</p>
                  </td>
                </tr>
              ) : (
                products.map((p: any) => {
                  const firstImg = p.images?.[0]?.url;
                  const currentDisplayVal =
                    editingStock[p.id] !== undefined ? editingStock[p.id] : p.stock;
                  const isDirty = editingStock[p.id] !== undefined && editingStock[p.id] !== p.stock;
                  const isSaved = savedSuccessId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3 px-4 flex items-center gap-3">
                        {firstImg ? (
                          <img
                            src={firstImg}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover bg-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            <Package size={16} />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-semibold text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                            {p.name}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-400">
                        <p className="text-slate-300 font-medium">{p.brand?.name || '—'}</p>
                        <span className="text-[10px] text-slate-400">{p.category?.name || '—'}</span>
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-200">
                        {formatBDT(p.price)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            p.stock <= 0
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : p.stock <= 3
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : p.stock <= 10
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {p.stock <= 0
                            ? 'Out of Stock'
                            : p.stock <= 3
                            ? 'Critical'
                            : p.stock <= 10
                            ? 'Low Stock'
                            : 'Healthy'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-sm text-slate-100">
                        {p.stock}
                      </td>

                      <td className="py-3 pr-4 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleQuickAdjust(p.id, p.stock, -1)}
                            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center transition-colors"
                            title="Decrease by 1"
                          >
                            <Minus size={12} />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentDisplayVal}
                            onChange={(e) => handleStockInputChange(p.id, e.target.value)}
                            className={`w-16 text-center bg-slate-950 border text-xs font-mono font-bold py-1.5 rounded-lg focus:outline-none ${
                              isDirty
                                ? 'border-amber-500 text-amber-300 ring-1 ring-amber-500'
                                : 'border-slate-800 text-slate-200'
                            }`}
                          />

                          <button
                            onClick={() => handleQuickAdjust(p.id, p.stock, +5)}
                            className="px-2 h-7 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-mono font-bold transition-colors"
                            title="Add 5 units"
                          >
                            +5
                          </button>

                          <button
                            onClick={() => handleSaveStock(p.id, p.stock)}
                            disabled={!isDirty || stockMutation.isPending}
                            className={`px-3 h-7 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              isSaved
                                ? 'bg-emerald-600 text-white'
                                : isDirty
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-400 opacity-50 cursor-not-allowed'
                            }`}
                            title="Save Stock Level"
                          >
                            {isSaved ? <Check size={13} /> : <Save size={13} />}
                            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
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
      </div>
    </div>
  );
};

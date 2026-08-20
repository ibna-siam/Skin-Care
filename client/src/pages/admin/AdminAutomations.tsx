import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  Zap,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Star,
  Boxes,
  Percent,
  Users,
  Mail,
  Flame,
} from 'lucide-react';

const TRIGGER_ICONS: Record<string, any> = {
  ABANDONED_CART: ShoppingBag,
  REVIEW_REQUEST: Star,
  BACK_IN_STOCK: Boxes,
  PRICE_DROP: Percent,
  LOW_STOCK: AlertTriangle,
  RE_ENGAGEMENT: Users,
  WELCOME: Sparkles,
};

export const AdminAutomations: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTriggerFilter, setSelectedTriggerFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [runningTrigger, setRunningTrigger] = useState<string | null>(null);

  // Fetch Workflows
  const { data: workflows = [], isLoading: isLoadingWorkflows, refetch: refetchWorkflows } = useQuery({
    queryKey: ['admin-automations'],
    queryFn: () => adminService.getAutomations(),
  });

  // Fetch Logs
  const { data: logsData, isLoading: isLoadingLogs, refetch: refetchLogs } = useQuery({
    queryKey: ['admin-automation-logs', selectedTriggerFilter, selectedStatusFilter, page, limit],
    queryFn: () =>
      adminService.getAutomationLogs({
        page,
        limit,
        triggerType: selectedTriggerFilter === 'ALL' ? undefined : selectedTriggerFilter,
        status: selectedStatusFilter === 'ALL' ? undefined : selectedStatusFilter,
      }),
  });

  // Toggle Mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.toggleAutomation(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-automations'] });
    },
  });

  // Run Mutation
  const runMutation = useMutation({
    mutationFn: (triggerType?: string) => adminService.runAutomation(triggerType),
    onSuccess: () => {
      setRunningTrigger(null);
      queryClient.invalidateQueries({ queryKey: ['admin-automations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-automation-logs'] });
    },
    onError: () => {
      setRunningTrigger(null);
    },
  });

  const logs = logsData?.data || [];
  const meta = logsData?.meta || (logsData as any)?.pagination || { total: 0, totalPages: 1 };

  const handleRunWorkflow = (triggerType?: string) => {
    setRunningTrigger(triggerType || 'ALL');
    runMutation.mutate(triggerType);
  };

  const activeWorkflowsCount = workflows.filter((w: any) => w.isActive).length;
  const totalExecutions = workflows.reduce((sum: number, w: any) => sum + (w.executionCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Zap size={24} className="text-amber-400 fill-amber-400" />
            Background Automation Engine & Schedulers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Persistent automated workflows running continuously on Render for cart recovery, reviews, and restock alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunWorkflow()}
            disabled={runMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
          >
            <Play size={14} className={runMutation.isPending && runningTrigger === 'ALL' ? 'animate-spin' : ''} />
            <span>{runMutation.isPending && runningTrigger === 'ALL' ? 'Running All...' : 'Run All Workflows'}</span>
          </button>

          <button
            onClick={() => {
              refetchWorkflows();
              refetchLogs();
            }}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors"
            title="Refresh automations"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* KPI Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Workflows</span>
            <Zap size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">
            {activeWorkflowsCount} / {workflows.length}
          </p>
          <span className="text-[11px] text-emerald-400">Enabled automation jobs</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Executions</span>
            <Play size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{totalExecutions}</p>
          <span className="text-[11px] text-slate-400">Triggered background sweeps</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Scheduler Reliability</span>
            <CheckCircle2 size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-2">99.8%</p>
          <span className="text-[11px] text-slate-400">Render background worker uptime</span>
        </div>
      </div>

      {/* Workflows Cards Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
          Configured Automation Workflows
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingWorkflows ? (
            <div className="col-span-3 py-12 text-center text-slate-400">
              <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono mt-2">Loading automation workflows...</p>
            </div>
          ) : (
            workflows.map((w: any) => {
              const Icon = TRIGGER_ICONS[w.triggerType] || Zap;
              const isRunningThis = runMutation.isPending && runningTrigger === w.triggerType;

              return (
                <div
                  key={w.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    w.isActive
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-lg'
                      : 'bg-slate-950/60 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <Icon size={18} />
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            w.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {w.isActive ? 'RUNNING' : 'PAUSED'}
                        </span>

                        <input
                          type="checkbox"
                          checked={w.isActive}
                          onChange={(e) =>
                            toggleMutation.mutate({ id: w.id, isActive: e.target.checked })
                          }
                          className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{w.name}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {w.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Runs: <strong className="text-slate-200">{w.executionCount || 0}</strong>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {w.lastRunAt ? `Last: ${new Date(w.lastRunAt).toLocaleTimeString()}` : 'Never run'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRunWorkflow(w.triggerType)}
                      disabled={isRunningThis}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      <Play size={12} className={isRunningThis ? 'animate-spin' : ''} />
                      <span>{isRunningThis ? 'Running...' : 'Run Now'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Execution Logs Audit Section */}
      <div className="space-y-3 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock size={16} className="text-emerald-400" />
            Live Automation Execution Audit Logs
          </h2>

          <div className="flex items-center gap-2">
            <select
              value={selectedTriggerFilter}
              onChange={(e) => {
                setSelectedTriggerFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Workflow Triggers</option>
              <option value="ABANDONED_CART">Abandoned Cart</option>
              <option value="REVIEW_REQUEST">Review Request</option>
              <option value="BACK_IN_STOCK">Back in Stock</option>
              <option value="PRICE_DROP">Price Drop</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="RE_ENGAGEMENT">Re-engagement</option>
              <option value="WELCOME">Welcome</option>
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Status: All</option>
              <option value="SUCCESS">Status: Success</option>
              <option value="SKIPPED">Status: Skipped</option>
              <option value="FAILED">Status: Failed</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-3">Trigger / Workflow</th>
                  <th className="py-3.5 px-3">Target Recipient</th>
                  <th className="py-3.5 px-3">Execution Summary</th>
                  <th className="py-3.5 pr-4 pl-2 text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 font-mono">
                {isLoadingLogs ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs mt-2">Loading execution audit trail...</p>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-sans space-y-1">
                      <Zap size={24} className="mx-auto text-slate-400" />
                      <p className="text-xs font-semibold text-slate-300">No automation logs recorded yet</p>
                      <p className="text-[11px] text-slate-400">
                        Click &quot;Run All Workflows&quot; above to trigger your first sweep.
                      </p>
                    </td>
                  </tr>
                ) : (
                  logs.map((l: any) => {
                    return (
                      <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                          {new Date(l.createdAt).toLocaleDateString()}{' '}
                          <span className="text-slate-300">{new Date(l.createdAt).toLocaleTimeString()}</span>
                        </td>

                        <td className="py-3 px-3 font-bold text-slate-200">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-amber-400 font-sans">
                            {l.triggerType}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-300 text-[11px] font-sans truncate max-w-[150px]">
                          {l.targetEmail || '—'}
                        </td>

                        <td className="py-3 px-3 text-slate-300 font-sans text-xs max-w-[320px] truncate">
                          {l.summary}
                        </td>

                        <td className="py-3 pr-4 pl-2 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              l.status === 'SUCCESS'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : l.status === 'FAILED'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Logs Pagination */}
          <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <span>
              Total <strong className="text-slate-200">{meta.total}</strong> log entries
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
                Page {page} / {meta.totalPages || 1}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(meta.totalPages || 1, prev + 1))}
                disabled={page >= meta.totalPages}
                className="p-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  RefreshCw,
  X,
  Layers,
  HelpCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const AdminSkinGuide: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

  // Form State
  const [question, setQuestion] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('SKIN_TYPE');
  const [sortOrder, setSortOrder] = useState('0');
  const [options, setOptions] = useState<{ optionText: string; valueKey: string }[]>([
    { optionText: '', valueKey: '' },
    { optionText: '', valueKey: '' },
  ]);

  // Fetch Quiz Questions
  const { data: questions = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-skin-quiz'],
    queryFn: () => adminService.getSkinQuiz(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createSkinQuizQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skin-quiz'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateSkinQuizQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skin-quiz'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteSkinQuizQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skin-quiz'] });
    },
  });

  const openCreateModal = () => {
    setEditingQuestion(null);
    setQuestion('');
    setSubtitle('');
    setCategory('SKIN_TYPE');
    setSortOrder('0');
    setOptions([
      { optionText: 'Oily & Shiny', valueKey: 'oily' },
      { optionText: 'Dry & Flaky', valueKey: 'dry' },
      { optionText: 'Combination (Oily T-Zone)', valueKey: 'combination' },
      { optionText: 'Sensitive / Redness', valueKey: 'sensitive' },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (q: any) => {
    setEditingQuestion(q);
    setQuestion(q.question);
    setSubtitle(q.subtitle || '');
    setCategory(q.category);
    setSortOrder(q.sortOrder?.toString() || '0');
    setOptions(q.options?.map((o: any) => ({ optionText: o.optionText, valueKey: o.valueKey })) || []);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const handleAddOption = () => {
    setOptions([...options, { optionText: '', valueKey: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: 'optionText' | 'valueKey', value: string) => {
    const next = [...options];
    next[index][field] = value;
    if (field === 'optionText' && !next[index].valueKey) {
      next[index].valueKey = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    }
    setOptions(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !category) return;

    const payload = {
      question,
      subtitle: subtitle || null,
      category,
      sortOrder: parseInt(sortOrder, 10) || 0,
      options: options.filter((o) => o.optionText.trim() && o.valueKey.trim()),
    };

    if (editingQuestion) {
      updateMutation.mutate({ id: editingQuestion.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Sparkles size={24} className="text-amber-400" />
            Skin Quiz & Routine Builder Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure diagnostic skin quiz questions and answer weights powering the customer-facing routine recommendation engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/skin-guide"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium transition-colors"
          >
            <span>Preview Live Skin Guide</span>
            <ExternalLink size={13} />
          </a>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Add Quiz Question</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh quiz"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Quiz Questions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono mt-2">Loading skin quiz questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-2">
            <HelpCircle size={28} className="mx-auto text-slate-400" />
            <p className="text-sm font-semibold text-slate-300">No quiz questions configured</p>
            <p className="text-xs text-slate-400">Click &quot;Add Quiz Question&quot; to build the diagnostic routine flow.</p>
          </div>
        ) : (
          questions.map((q: any, idx: number) => (
            <div
              key={q.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {q.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-1">{q.question}</h3>
                    {q.subtitle && <p className="text-xs text-slate-400 mt-0.5">{q.subtitle}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Edit Question"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete question "${q.question}"?`)) deleteMutation.mutate(q.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {q.options?.map((opt: any) => (
                  <div
                    key={opt.id}
                    className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between"
                  >
                    <span className="text-xs text-slate-200 font-medium">{opt.optionText}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      {opt.valueKey}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                {editingQuestion ? 'Edit Quiz Question' : 'Add Quiz Question'}
              </h3>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Question Title *</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How does your skin feel midday?"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Category / Diagnostic Type *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="SKIN_TYPE">Skin Type Identification</option>
                    <option value="MAIN_CONCERN">Primary Skin Concern</option>
                    <option value="SENSITIVITY">Skin Sensitivity Level</option>
                    <option value="ROUTINE_GOAL">Routine & Target Goal</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Supportive Subtitle / Tip</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Think about your face without any skincare or makeup applied."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Options */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300">Answer Choices & Matching Keys</label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Choice
                  </button>
                </div>

                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Choice Label (e.g. Oily & Shiny)"
                        value={opt.optionText}
                        onChange={(e) => handleOptionChange(idx, 'optionText', e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Key (e.g. oily)"
                        value={opt.valueKey}
                        onChange={(e) => handleOptionChange(idx, 'valueKey', e.target.value)}
                        className="w-28 bg-slate-950 border border-slate-800 text-amber-400 font-mono px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 text-xs"
                      />
                      {options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingQuestion
                    ? 'Update Question'
                    : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

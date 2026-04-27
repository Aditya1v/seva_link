import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, ArrowLeft, Brain, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

const categories = ['Medical', 'Food', 'Shelter', 'Water & Sanitation', 'Transport', 'Education', 'Clothing', 'Counseling', 'Other'];

export function NeedCreation() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    rawText:
      'Urgent: District 5 clinic needs first aid kits, insulin, and transport support today for elderly residents and families with children.',
    location: 'District 5, Community Center',
    category: '',
    reporter: 'Community Hotline',
    affectedPeople: 50,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (form.rawText.trim().length < 12) {
      setError('Add a little more detail so ReliefSync can prioritize the need.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await api.createNeed({
        ...form,
        category: form.category || undefined,
        affectedPeople: Number(form.affectedPeople) || 0,
      });
      navigate(`/admin/needs/${result.need.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create need.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <button type="button" onClick={() => navigate('/admin/needs')} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="size-4" />
        Back to needs
      </button>

      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
          <Sparkles className="size-4" />
          AI structure with deterministic fallback
        </div>
        <h1 className="text-3xl font-bold mb-2">Create Community Need</h1>
        <p className="text-slate-600">Paste messy field notes, hotline messages, or volunteer reports. ReliefSync turns them into a ranked action item.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="lg:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="size-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700 mb-2">Raw need text</label>
          <textarea
            value={form.rawText}
            onChange={(event) => setForm({ ...form, rawText: event.target.value })}
            rows={8}
            className="mb-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Example: urgent food supplies needed by tonight for 80 families..."
            required
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <input
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="District 5, Community Center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category hint</label>
              <select
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Infer from text</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reporter</label>
              <input
                value={form.reporter}
                onChange={(event) => setForm({ ...form, reporter: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hotline, volunteer, resident"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">People affected</label>
              <input
                type="number"
                min="0"
                value={form.affectedPeople}
                onChange={(event) => setForm({ ...form, affectedPeople: Number(event.target.value) })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-white shadow-sm transition-all hover:shadow-lg disabled:opacity-60 md:w-auto"
          >
            <Brain className="size-4" />
            {isSubmitting ? 'Scoring need...' : 'Create and Score Need'}
          </button>
        </form>

        <aside className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold mb-3">What ReliefSync Extracts</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p>Title, category, urgency, priority score, summary, keywords, and a plain-English reason.</p>
            <p>Scoring considers urgency terms, vulnerable groups, affected people, scarcity, location cues, and category severity.</p>
            <p>The API will call an LLM only when an AI key is configured. Otherwise this same flow runs from transparent heuristics.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

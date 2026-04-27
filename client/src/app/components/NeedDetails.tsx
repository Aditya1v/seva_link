import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Brain, CheckCircle, MapPin, Save, UserPlus } from 'lucide-react';
import { api } from '../lib/api';
import type { MatchSuggestion, NeedDetailsPayload, NeedStatus, Urgency } from '../lib/types';

const urgencyClasses: Record<Urgency, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

const statusOptions: NeedStatus[] = ['pending', 'assigned', 'completed'];
const urgencyOptions: Urgency[] = ['critical', 'high', 'medium', 'low'];

export function NeedDetails() {
  const { needId } = useParams();
  const navigate = useNavigate();
  const [payload, setPayload] = useState<NeedDetailsPayload | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [assigning, setAssigning] = useState('');

  const loadNeed = async () => {
    if (!needId) return;
    try {
      const result = await api.need(needId);
      setPayload(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load need.');
    }
  };

  useEffect(() => {
    loadNeed();
  }, [needId]);

  const updateField = (field: string, value: string | number | string[]) => {
    if (!payload) return;
    setPayload({ ...payload, need: { ...payload.need, [field]: value } });
  };

  const saveOverrides = async () => {
    if (!payload) return;
    setIsSaving(true);
    try {
      const result = await api.updateNeed(payload.need.id, {
        title: payload.need.title,
        category: payload.need.category,
        urgency: payload.need.urgency,
        priorityScore: payload.need.priorityScore,
        summary: payload.need.summary,
        reason: payload.need.reason,
        keywords: payload.need.keywords,
        status: payload.need.status,
        affectedPeople: payload.need.affectedPeople,
        location: payload.need.location,
      });
      setPayload(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save overrides.');
    } finally {
      setIsSaving(false);
    }
  };

  const assignVolunteer = async (match: MatchSuggestion) => {
    if (!payload) return;
    setAssigning(match.volunteerId);
    try {
      await api.assignNeed(payload.need.id, match.volunteerId, `Manual override assignment to ${match.name}.`);
      await loadNeed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to assign volunteer.');
    } finally {
      setAssigning('');
    }
  };

  if (error && !payload) {
    return (
      <div className="p-8">
        <button type="button" onClick={() => navigate('/admin/needs')} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600">
          <ArrowLeft className="size-4" />
          Back to needs
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">Loading need details...</div>
      </div>
    );
  }

  const { need, matches, assignment } = payload;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button type="button" onClick={() => navigate('/admin/needs')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="size-4" />
          Back to needs
        </button>
        <Link to="/admin/matching" className="text-sm font-medium text-blue-700 hover:text-blue-800">
          Open volunteer ranking
        </Link>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="size-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${urgencyClasses[need.urgency]}`}>{need.urgency}</span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{need.category}</span>
                {need.manualOverride && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Manual override saved</span>}
              </div>
              <h1 className="text-3xl font-bold">{need.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1"><MapPin className="size-4" />{need.location || 'Location not set'}</span>
                <span>{need.affectedPeople || 0} people affected</span>
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 px-6 py-4 text-center text-white">
              <p className="text-sm text-blue-100">Priority</p>
              <p className="text-4xl font-bold">{need.priorityScore}</p>
            </div>
          </div>

          <div className="mb-6 rounded-xl border bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <Brain className="size-4 text-blue-600" />
              Decision reason
            </div>
            <p className="text-sm text-slate-600">{need.reason}</p>
            {need.aiWarning && <p className="mt-2 text-xs text-orange-700">{need.aiWarning}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-600 mb-2">Title</label>
              <input value={need.title} onChange={(event) => updateField('title', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Category</label>
              <input value={need.category} onChange={(event) => updateField('category', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Urgency</label>
              <select value={need.urgency} onChange={(event) => updateField('urgency', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {urgencyOptions.map((urgency) => <option key={urgency} value={urgency}>{urgency}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Status</label>
              <select value={need.status} onChange={(event) => updateField('status', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Priority score</label>
              <input type="number" min="1" max="100" value={need.priorityScore} onChange={(event) => updateField('priorityScore', Number(event.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">People affected</label>
              <input type="number" min="0" value={need.affectedPeople} onChange={(event) => updateField('affectedPeople', Number(event.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-600 mb-2">Summary</label>
            <textarea rows={4} value={need.summary} onChange={(event) => updateField('summary', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-600 mb-2">Keywords</label>
            <input
              value={need.keywords.join(', ')}
              onChange={(event) => updateField('keywords', event.target.value.split(',').map((keyword) => keyword.trim()).filter(Boolean))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button type="button" onClick={saveOverrides} disabled={isSaving} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-white hover:bg-slate-800 disabled:opacity-60">
            <Save className="size-4" />
            {isSaving ? 'Saving...' : 'Save Manual Override'}
          </button>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold mb-1">Current Assignment</h2>
            {assignment ? (
              <div className="mt-4 rounded-xl border bg-slate-50 p-4">
                <p className="font-medium">{assignment.volunteer?.name || 'Volunteer assigned'}</p>
                <p className="text-sm text-slate-500">{assignment.status.replace('_', ' ')}</p>
                <p className="mt-2 text-xs text-slate-500">{assignment.volunteer?.email}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No volunteer assigned yet.</p>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="font-semibold mb-1">Ranked Volunteers</h2>
            <p className="text-sm text-slate-500">Scores combine skills, category fit, location, availability, workload, and past work.</p>
            <div className="mt-4 space-y-3">
              {matches.map((match) => (
                <div key={match.volunteerId} className="rounded-xl border bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{match.name}</p>
                      <p className="text-xs text-slate-500">{match.location} · {match.availability}</p>
                    </div>
                    <span className="rounded-full bg-green-50 px-2 py-1 text-sm font-semibold text-green-700">{match.score}%</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">{match.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {match.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">{skill}</span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => assignVolunteer(match)}
                    disabled={Boolean(assigning)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-sm text-white disabled:opacity-60"
                  >
                    {assignment?.volunteerId === match.volunteerId ? <CheckCircle className="size-4" /> : <UserPlus className="size-4" />}
                    {assigning === match.volunteerId ? 'Assigning...' : assignment?.volunteerId === match.volunteerId ? 'Assigned' : 'Assign Volunteer'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

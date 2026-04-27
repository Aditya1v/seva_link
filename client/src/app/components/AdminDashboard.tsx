import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Brain, CheckCircle, ClipboardList, MapPin, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';
import type { DashboardPayload } from '../lib/types';

const urgencyClasses = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState('');

  const loadDashboard = async () => {
    try {
      const result = await api.dashboard();
      setDashboard(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard.');
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const assignTopVolunteer = async (needId: string, volunteerId: string) => {
    setAssigning(`${needId}:${volunteerId}`);
    try {
      await api.assignNeed(needId, volunteerId, 'Assigned from NGO dashboard.');
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to assign volunteer.');
    } finally {
      setAssigning('');
    }
  };

  if (error && !dashboard) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="p-8">
        <div className="rounded-xl border bg-white p-6 text-slate-600 shadow-sm">Loading NGO dashboard...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Needs', value: dashboard.stats.totalNeeds, icon: ClipboardList, iconClass: 'bg-blue-100 text-blue-600' },
    { label: 'Pending', value: dashboard.stats.pending, icon: AlertCircle, iconClass: 'bg-red-100 text-red-600' },
    { label: 'Assigned', value: dashboard.stats.assigned, icon: Users, iconClass: 'bg-purple-100 text-purple-600' },
    { label: 'Completed', value: dashboard.stats.completed, icon: CheckCircle, iconClass: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">NGO Dashboard</h1>
          <p className="text-slate-600">Prioritized community needs, AI explanations, and assignable volunteer matches.</p>
        </div>
        <Link
          to="/admin/needs/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-white shadow-sm hover:shadow-lg"
        >
          <Sparkles className="size-4" />
          Create Need
        </Link>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white p-6 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`size-12 rounded-xl flex items-center justify-center ${card.iconClass}`}>
                  <Icon className="size-6" />
                </div>
                <span className="text-xs px-2 py-1 bg-slate-50 text-slate-600 rounded-full">Live</span>
              </div>
              <p className="text-sm text-slate-600 mb-1">{card.label}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Requests Over Time</h3>
              <p className="text-sm text-slate-500">Needs created in the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
              <div className="size-2 bg-blue-600 rounded-full animate-pulse"></div>
              API Live
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dashboard.trend}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Urgent Needs</h3>
            <span className="size-2 bg-red-600 rounded-full animate-pulse"></span>
          </div>
          <div className="space-y-4">
            {dashboard.urgentNeeds.length === 0 && <p className="text-sm text-slate-500">No open needs yet.</p>}
            {dashboard.urgentNeeds.map((need) => (
              <Link key={need.id} to={`/admin/needs/${need.id}`} className="block p-4 bg-red-50 rounded-xl border border-red-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-medium text-sm">{need.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full border ${urgencyClasses[need.urgency]}`}>{need.urgency}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="size-3" />
                  <span>{need.location || 'Location not set'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Ranked Volunteer Suggestions</h3>
            <p className="text-sm text-slate-500">Top open needs with explainable match recommendations.</p>
          </div>
          <div className="space-y-4">
            {dashboard.suggestions.map(({ need, matches }) => (
              <div key={need.id} className="rounded-xl border bg-slate-50 p-4">
                <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Link to={`/admin/needs/${need.id}`} className="font-semibold hover:text-blue-700">{need.title}</Link>
                    <p className="mt-1 text-sm text-slate-600">{need.reason}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-blue-700">{need.priorityScore}/100</span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {matches.map((match) => (
                    <div key={match.volunteerId} className="rounded-xl border bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{match.name}</p>
                          <p className="text-xs text-slate-500">{match.location} · {match.availability}</p>
                        </div>
                        <span className="rounded-full bg-green-50 px-2 py-1 text-sm font-semibold text-green-700">{match.score}%</span>
                      </div>
                      <p className="mt-3 text-xs text-slate-600">{match.reason}</p>
                      <button
                        type="button"
                        onClick={() => assignTopVolunteer(need.id, match.volunteerId)}
                        disabled={Boolean(assigning)}
                        className="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
                      >
                        {assigning === `${need.id}:${match.volunteerId}` ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-2xl text-white">
          <div className="flex items-start gap-4">
            <div className="size-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">AI Insight</h3>
              <p className="text-blue-50 text-sm">{dashboard.insight}</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-white/15 p-4 text-sm text-blue-50">
            External LLM calls are optional. If the AI key is absent or fails, ReliefSync keeps using deterministic scoring with visible reasons.
          </div>
        </div>
      </div>
    </div>
  );
}

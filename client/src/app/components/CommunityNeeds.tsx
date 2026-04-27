import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Calendar, Filter, MapPin, PlusCircle, Search, User } from 'lucide-react';
import { api } from '../lib/api';
import type { Need, NeedStatus, Urgency } from '../lib/types';

const urgencyColor: Record<Urgency, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

const statusColor: Record<NeedStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
};

export function CommunityNeeds() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | NeedStatus>('all');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNeeds() {
      try {
        const result = await api.needs();
        setNeeds(result.needs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load needs.');
      } finally {
        setIsLoading(false);
      }
    }
    loadNeeds();
  }, []);

  const filteredNeeds = useMemo(() => {
    return needs.filter((need) => {
      const matchesStatus = statusFilter === 'all' || need.status === statusFilter;
      const haystack = `${need.title} ${need.summary} ${need.category} ${need.location} ${need.keywords.join(' ')}`.toLowerCase();
      return matchesStatus && haystack.includes(search.toLowerCase());
    });
  }, [needs, search, statusFilter]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Needs</h1>
          <p className="text-slate-600">Review structured requests, AI scores, and assignment status.</p>
        </div>
        <Link
          to="/admin/needs/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-white shadow-sm hover:shadow-lg"
        >
          <PlusCircle className="size-4" />
          New Need
        </Link>
      </div>

      <div className="mb-6 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search needs, categories, locations, keywords..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-slate-600">
              <Filter className="size-4" />
              Status
            </div>
            {(['all', 'pending', 'assigned', 'completed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-4 py-2 text-sm capitalize transition-colors ${
                  statusFilter === status ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="size-5" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">Loading community needs...</div>
      ) : filteredNeeds.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h3 className="font-semibold">No needs found</h3>
          <p className="mt-2 text-sm text-slate-500">Create a new request to see ReliefSync structure and prioritize it.</p>
          <Link to="/admin/needs/new" className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-white">
            Create Need
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNeeds.map((need) => (
            <Link
              key={need.id}
              to={`/admin/needs/${need.id}`}
              className="block bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h3 className="font-semibold text-lg">{need.title}</h3>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${urgencyColor[need.urgency]}`}>
                      <span className="text-xs font-medium capitalize">{need.urgency}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-xs font-medium capitalize ${statusColor[need.status]}`}>
                      {need.status}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{need.summary}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      <span>{need.location || 'Location not set'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="size-4" />
                      <span>{need.reporter || 'Unknown reporter'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      <span>{new Date(need.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="lg:text-right">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">{need.category}</span>
                  <p className="text-sm text-slate-600 mt-2">{need.affectedPeople || 0} people</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{need.priorityScore}</p>
                  <p className="text-xs text-slate-500">priority score</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

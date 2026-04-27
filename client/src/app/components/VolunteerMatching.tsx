import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle, Clock, MapPin, Navigation, Sparkles, UserPlus } from 'lucide-react';
import { api } from '../lib/api';
import type { MatchSuggestion, Need, Volunteer } from '../lib/types';

export function VolunteerMatching() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [matches, setMatches] = useState<MatchSuggestion[]>([]);
  const [selectedNeedId, setSelectedNeedId] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState('');

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [needResult, volunteerResult] = await Promise.all([api.needs(), api.volunteers()]);
        const openNeeds = needResult.needs.filter((need) => need.status !== 'completed');
        setNeeds(openNeeds);
        setVolunteers(volunteerResult.volunteers);
        setSelectedNeedId(openNeeds[0]?.id || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load matching data.');
      }
    }
    loadInitialData();
  }, []);

  const selectedNeed = useMemo(() => needs.find((need) => need.id === selectedNeedId) || null, [needs, selectedNeedId]);

  useEffect(() => {
    async function loadMatches() {
      if (!selectedNeedId) return;
      try {
        const result = await api.matches(selectedNeedId);
        setMatches(result.matches);
        setSelectedVolunteer(result.matches[0]?.volunteerId || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to rank volunteers.');
      }
    }
    loadMatches();
  }, [selectedNeedId]);

  const assignVolunteer = async (volunteerId: string) => {
    if (!selectedNeed) return;
    setAssigning(volunteerId);
    try {
      await api.assignNeed(selectedNeed.id, volunteerId, 'Assigned from volunteer ranking page.');
      const result = await api.needs();
      setNeeds(result.needs.filter((need) => need.status !== 'completed'));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to assign volunteer.');
    } finally {
      setAssigning('');
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-50';
    if (score >= 60) return 'text-blue-700 bg-blue-50';
    return 'text-yellow-700 bg-yellow-50';
  };

  return (
    <div className="min-h-full bg-slate-50">
      {error && <div className="m-4 md:m-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      <div className="grid min-h-full grid-cols-1 xl:grid-cols-[420px_1fr]">
        <div className="bg-white border-r p-4 md:p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs mb-4">
              <Sparkles className="size-3" />
              <span>AI Smart Matching</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Volunteer Ranking</h1>
            <p className="text-slate-600">Choose a need and review explainable volunteer matches.</p>
          </div>

          <label className="block text-sm font-medium text-slate-700 mb-2">Open need</label>
          <select
            value={selectedNeedId}
            onChange={(event) => setSelectedNeedId(event.target.value)}
            className="mb-6 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {needs.map((need) => (
              <option key={need.id} value={need.id}>{need.title}</option>
            ))}
          </select>

          {selectedNeed ? (
            <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border mb-6">
              <div className="flex items-start justify-between mb-4 gap-4">
                <h2 className="text-xl font-semibold">{selectedNeed.title}</h2>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium capitalize">{selectedNeed.urgency}</span>
              </div>
              <p className="text-slate-600 mb-4">{selectedNeed.summary}</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-slate-400" />
                  <span className="text-slate-700">{selectedNeed.location || 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-slate-400" />
                  <span className="text-slate-700">{selectedNeed.status}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700 mb-2">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {selectedNeed.keywords.map((keyword) => (
                  <span key={keyword} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{keyword}</span>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                {selectedNeed.reason}
              </div>
              <Link to={`/admin/needs/${selectedNeed.id}`} className="mt-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-800">
                View need details
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">No open needs available.</div>
          )}

          <div className="rounded-xl border bg-white p-4 text-sm text-slate-600">
            {volunteers.length} volunteers available in the directory. Matching considers skills, keywords, location, availability, workload, category fit, and past assignments.
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Suggested Volunteers</h2>
            <p className="text-slate-600">Ranked for the selected need with transparent explanations.</p>
          </div>

          <div className="space-y-4">
            {matches.map((volunteer) => (
              <div
                key={volunteer.volunteerId}
                onClick={() => setSelectedVolunteer(volunteer.volunteerId)}
                className={`bg-white p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedVolunteer === volunteer.volunteerId
                    ? 'border-blue-600 shadow-lg shadow-blue-100'
                    : 'border-transparent hover:border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="size-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {volunteer.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{volunteer.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Award className="size-4 text-yellow-500" />
                        <span className="text-sm text-slate-600">{volunteer.rating.toFixed(1)}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-sm text-slate-600">{volunteer.workload} active tasks</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-semibold ${getMatchColor(volunteer.score)}`}>
                    <div className="text-xs opacity-75 mb-0.5">Match Score</div>
                    <div className="text-2xl">{volunteer.score}%</div>
                  </div>
                </div>

                <p className="mb-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{volunteer.reason}</p>

                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">SKILLS</p>
                  <div className="flex flex-wrap gap-2">
                    {volunteer.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-600">
                        {selectedNeed?.keywords.some((keyword) => skill.toLowerCase().includes(keyword.toLowerCase())) && <CheckCircle className="inline size-3 mr-1" />}
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Navigation className="size-4" />
                    <span>{volunteer.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="size-4" />
                    <span className="capitalize">{volunteer.availability}</span>
                  </div>
                </div>

                {selectedVolunteer === volunteer.volunteerId && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      assignVolunteer(volunteer.volunteerId);
                    }}
                    disabled={Boolean(assigning)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white hover:shadow-lg transition-all disabled:opacity-60"
                  >
                    <UserPlus className="size-4" />
                    {assigning === volunteer.volunteerId ? 'Assigning...' : 'Assign Volunteer'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

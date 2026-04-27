import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Award, CheckCircle, Circle, Clock, MapPin, Sparkles, TrendingUp, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import type { Assignment, AssignmentStatus, VolunteerDashboardPayload } from '../lib/types';

const statusColor: Record<AssignmentStatus, string> = {
  pending_acceptance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  accepted: 'bg-blue-100 text-blue-700 border-blue-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
};

export function VolunteerPanel() {
  const [dashboard, setDashboard] = useState<VolunteerDashboardPayload | null>(null);
  const [filter, setFilter] = useState<'all' | AssignmentStatus>('all');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const loadDashboard = async () => {
    try {
      const result = await api.volunteerDashboard();
      setDashboard(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load volunteer dashboard.');
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const filteredTasks = useMemo(() => {
    if (!dashboard) return [];
    return filter === 'all' ? dashboard.assignments : dashboard.assignments.filter((task) => task.status === filter);
  }, [dashboard, filter]);

  const respond = async (assignment: Assignment, status: 'accepted' | 'rejected') => {
    setBusyId(assignment.id);
    try {
      await api.respondToAssignment(assignment.id, status);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update assignment.');
    } finally {
      setBusyId('');
    }
  };

  const complete = async (assignment: Assignment) => {
    setBusyId(assignment.id);
    try {
      await api.updateAssignmentStatus(assignment.id, 'completed');
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete assignment.');
    } finally {
      setBusyId('');
    }
  };

  const getStatusIcon = (status: AssignmentStatus) => {
    if (status === 'completed') return <CheckCircle className="size-4" />;
    if (status === 'rejected') return <XCircle className="size-4" />;
    return <Circle className="size-4" />;
  };

  if (!dashboard) {
    return (
      <div className="p-4 md:p-8">
        {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : <div className="rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">Loading volunteer dashboard...</div>}
      </div>
    );
  }

  const { volunteer, opportunities } = dashboard;
  const initials = volunteer.name.split(' ').map((part) => part[0]).join('').slice(0, 2);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Volunteer Dashboard</h1>
          <p className="text-slate-600">Manage assignments, availability, and skill-based opportunities.</p>
        </div>
        <Link to="/volunteer/profile" className="rounded-xl border bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
          Update Profile
        </Link>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 md:p-8 rounded-2xl text-white mb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-6">
            <div className="size-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{volunteer.name}</h2>
              <p className="text-blue-100 text-sm mb-4">Volunteer since {volunteer.joinedDate}</p>
              <div className="flex flex-wrap gap-2">
                {volunteer.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">{skill}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
            <p className="text-sm text-blue-100 mb-1">Availability</p>
            <p className="text-2xl font-bold capitalize">{volunteer.availability}</p>
            <p className="text-xs text-blue-100 mt-1">{volunteer.workload}/{volunteer.capacity} active tasks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mt-8 pt-6 border-t border-white/20 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="size-5 text-green-300" />
              <p className="text-3xl font-bold">{volunteer.completedTasks}</p>
            </div>
            <p className="text-blue-100 text-sm">Tasks Completed</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="size-5 text-blue-300" />
              <p className="text-3xl font-bold">{volunteer.hoursVolunteered}</p>
            </div>
            <p className="text-blue-100 text-sm">Hours Volunteered</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="size-5 text-yellow-300" />
              <p className="text-3xl font-bold">{volunteer.rating.toFixed(1)}</p>
            </div>
            <p className="text-blue-100 text-sm">Average Rating</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-bold">My Assignments</h2>
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'pending_acceptance', 'accepted', 'completed'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                    filter === item ? 'bg-slate-900 text-white' : 'bg-white border hover:bg-slate-50'
                  }`}
                >
                  {item.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredTasks.map((assignment) => (
              <div key={assignment.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{assignment.need?.title}</h3>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">{assignment.need?.category}</span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${statusColor[assignment.status]}`}>
                    {getStatusIcon(assignment.status)}
                    <span className="capitalize">{assignment.status.replace('_', ' ')}</span>
                  </div>
                </div>

                <p className="mb-4 text-sm text-slate-600">{assignment.need?.summary}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="size-4 text-slate-400" />
                    <span>{assignment.need?.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="size-4 text-slate-400" />
                    <span>Assigned {new Date(assignment.assignedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  {assignment.status === 'pending_acceptance' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => respond(assignment, 'accepted')} disabled={busyId === assignment.id} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-60">Accept</button>
                      <button onClick={() => respond(assignment, 'rejected')} disabled={busyId === assignment.id} className="rounded-lg border px-4 py-2 text-sm text-slate-700 disabled:opacity-60">Reject</button>
                    </div>
                  )}
                  {assignment.status === 'accepted' && (
                    <button onClick={() => complete(assignment)} disabled={busyId === assignment.id} className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60">
                      Mark Completed
                    </button>
                  )}
                  {assignment.status === 'completed' && (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <TrendingUp className="size-4" />
                      <span>{assignment.need?.affectedPeople || 0} people helped</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-5 text-blue-600" />
              <h2 className="font-semibold">Recommended Opportunities</h2>
            </div>
            <div className="space-y-3">
              {opportunities.length === 0 && <p className="text-sm text-slate-500">No strong open matches right now.</p>}
              {opportunities.map(({ need, match }) => (
                <div key={need.id} className="rounded-xl border bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{need.title}</p>
                      <p className="text-xs text-slate-500">{need.category} · {need.location}</p>
                    </div>
                    <span className="rounded-full bg-green-50 px-2 py-1 text-sm font-semibold text-green-700">{match.score}%</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">{match.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

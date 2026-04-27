import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Save } from 'lucide-react';
import { api } from '../lib/api';
import type { Availability, Volunteer } from '../lib/types';

const availabilityOptions: Availability[] = ['available', 'limited', 'busy'];

export function ProfileAvailability() {
  const [profile, setProfile] = useState<Volunteer | null>(null);
  const [skillsText, setSkillsText] = useState('');
  const [categoriesText, setCategoriesText] = useState('');
  const [daysText, setDaysText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const result = await api.volunteerDashboard();
        setProfile(result.volunteer);
        setSkillsText(result.volunteer.skills.join(', '));
        setCategoriesText(result.volunteer.categories.join(', '));
        setDaysText(result.volunteer.availableDays.join(', '));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load profile.');
      }
    }
    loadProfile();
  }, []);

  const updateProfile = (field: keyof Volunteer, value: string | number) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setError('');
    setMessage('');
    try {
      const result = await api.updateVolunteer({
        phone: profile.phone,
        location: profile.location,
        availability: profile.availability,
        capacity: Number(profile.capacity) || 1,
        bio: profile.bio,
        skills: skillsText.split(',').map((item) => item.trim()).filter(Boolean),
        categories: categoriesText.split(',').map((item) => item.trim()).filter(Boolean),
        availableDays: daysText.split(',').map((item) => item.trim()).filter(Boolean),
      });
      setProfile(result.volunteer);
      setMessage('Profile updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="p-4 md:p-8">
        {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : <div className="rounded-2xl border bg-white p-6 text-slate-600 shadow-sm">Loading profile...</div>}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile & Availability</h1>
        <p className="text-slate-600">Keep your skills, location, and schedule current so NGO teams can assign you accurately.</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="size-5" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          <CheckCircle className="size-5" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={saveProfile} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-600 mb-2">Name</label>
              <input value={profile.name} disabled className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Email</label>
              <input value={profile.email} disabled className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Phone</label>
              <input value={profile.phone || ''} onChange={(event) => updateProfile('phone', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Location</label>
              <input value={profile.location} onChange={(event) => updateProfile('location', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Availability</label>
              <select value={profile.availability} onChange={(event) => updateProfile('availability', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {availabilityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-2">Capacity</label>
              <input type="number" min="1" value={profile.capacity} onChange={(event) => updateProfile('capacity', Number(event.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-600 mb-2">Skills</label>
            <input value={skillsText} onChange={(event) => setSkillsText(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-600 mb-2">Preferred categories</label>
            <input value={categoriesText} onChange={(event) => setCategoriesText(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-600 mb-2">Available days</label>
            <input value={daysText} onChange={(event) => setDaysText(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-600 mb-2">Bio</label>
            <textarea rows={4} value={profile.bio || ''} onChange={(event) => updateProfile('bio', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <button type="submit" disabled={isSaving} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-white disabled:opacity-60">
            <Save className="size-4" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </section>

        <aside className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Matching Signals</h2>
          <div className="space-y-4 text-sm text-slate-600">
            <p>Skill and category terms are matched against need keywords.</p>
            <p>District-level location match improves ranking when a need mentions the same district.</p>
            <p>Availability and workload help avoid over-assigning busy volunteers.</p>
          </div>
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm">
            <p className="font-medium text-slate-900">Current workload</p>
            <p className="mt-1 text-slate-600">{profile.workload}/{profile.capacity} active assignments</p>
          </div>
        </aside>
      </form>
    </div>
  );
}

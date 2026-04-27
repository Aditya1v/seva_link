import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, User, Building, Heart, ArrowRight, Eye, EyeOff, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { getRoleHome, useAuth } from '../lib/auth';

export function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'ngo' | 'volunteer'>('volunteer');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
    location: '',
    skills: 'Communication, Medical, Transport',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      const user = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        organization: formData.organization,
        location: formData.location,
        skills: formData.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      });
      navigate(getRoleHome(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="size-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="size-6 text-white" />
          </div>
          <span className="text-2xl font-bold">ReliefSync AI</span>
        </Link>

        {/* Signup Card */}
        <div className="bg-white rounded-3xl shadow-xl border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
            <p className="text-slate-600">Join us in making a difference in communities</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole('volunteer')}
              className={`p-6 rounded-2xl border-2 transition-all ${
                role === 'volunteer'
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`size-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                role === 'volunteer' ? 'bg-blue-600' : 'bg-slate-100'
              }`}>
                <Heart className={`size-6 ${role === 'volunteer' ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <h3 className="font-semibold mb-1">Volunteer</h3>
              <p className="text-sm text-slate-600">Help communities in need</p>
              {role === 'volunteer' && (
                <div className="mt-3 flex items-center justify-center gap-1 text-blue-600 text-sm">
                  <CheckCircle className="size-4" />
                  <span>Selected</span>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setRole('ngo')}
              className={`p-6 rounded-2xl border-2 transition-all ${
                role === 'ngo'
                  ? 'border-purple-600 bg-purple-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`size-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                role === 'ngo' ? 'bg-purple-600' : 'bg-slate-100'
              }`}>
                <Building className={`size-6 ${role === 'ngo' ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <h3 className="font-semibold mb-1">NGO / Organization</h3>
              <p className="text-sm text-slate-600">Manage resources & teams</p>
              {role === 'ngo' && (
                <div className="mt-3 flex items-center justify-center gap-1 text-purple-600 text-sm">
                  <CheckCircle className="size-4" />
                  <span>Selected</span>
                </div>
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Organization (only for NGO) */}
            {role === 'ngo' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Organization Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Your Organization"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {role === 'volunteer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Home Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="District 5"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Skills
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="Food, Transport, Medical"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Must be at least 8 characters long</p>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="text-sm text-slate-600">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

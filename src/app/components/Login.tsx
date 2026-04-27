import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Brain, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getRoleHome, useAuth } from '../lib/auth';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      const from = typeof location.state === 'object' && location.state && 'from' in location.state ? String(location.state.from) : '';
      navigate(from || getRoleHome(user.role), { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo1234');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="size-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="size-6 text-white" />
          </div>
          <span className="text-2xl font-bold">ReliefSync AI</span>
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-slate-600">Sign in to continue to your dashboard</p>
          </div>

          {formError && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-600 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Quick Access */}
        <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-xs text-blue-800 font-medium mb-2">Quick Access Demo:</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <button type="button" onClick={() => fillDemo('admin@relief.org')} className="px-2 py-1 bg-white rounded-lg text-slate-600 hover:text-blue-700">
              admin@relief.org / demo1234
            </button>
            <button type="button" onClick={() => fillDemo('ngo@relief.org')} className="px-2 py-1 bg-white rounded-lg text-slate-600 hover:text-blue-700">
              ngo@relief.org / demo1234
            </button>
            <button type="button" onClick={() => fillDemo('volunteer@email.com')} className="px-2 py-1 bg-white rounded-lg text-slate-600 hover:text-blue-700">
              volunteer@email.com / demo1234
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

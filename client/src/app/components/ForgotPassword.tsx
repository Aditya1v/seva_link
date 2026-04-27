import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock password reset - in production, this would call an API
    setSubmitted(true);
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

        {/* Reset Password Card */}
        <div className="bg-white rounded-3xl shadow-xl border p-8">
          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <div className="size-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="size-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
                <p className="text-slate-600">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

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

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Send Reset Link</span>
                  <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Back to Login */}
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 mt-6 transition-colors"
              >
                <ArrowLeft className="size-4" />
                <span>Back to login</span>
              </Link>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="size-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="size-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Check Your Email</h1>
                <p className="text-slate-600 mb-6">
                  We've sent password reset instructions to
                </p>
                <p className="font-medium text-slate-900 mb-8 px-4 py-3 bg-slate-50 rounded-xl">
                  {email}
                </p>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Didn't receive the email?</strong> Check your spam folder or try again with a different email address.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                  >
                    Try Another Email
                  </button>
                  <Link
                    to="/login"
                    className="block w-full py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-white rounded-2xl border text-center">
          <p className="text-sm text-slate-600">
            Need help?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

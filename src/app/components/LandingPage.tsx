import { Link } from 'react-router';
import { Brain, Users, TrendingUp, Zap, Target, Network } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="size-5 text-white" />
            </div>
            <span className="text-xl font-semibold">ReliefSync AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm mb-6">
          <Zap className="size-4" />
          <span>AI-Powered Resource Allocation</span>
        </div>
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Smart Resource Allocation<br />for Social Impact
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Empower NGOs and communities with AI-driven insights to match volunteers, identify urgent needs, and maximize impact in real-time.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/signup"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Problem → Solution → Impact */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-2xl shadow-sm border">
            <div className="size-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <Target className="size-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">The Problem</h3>
            <p className="text-slate-600">
              Scattered data, inefficient volunteer matching, and delayed response times prevent NGOs from reaching those in need quickly.
            </p>
          </div>
          <div className="p-8 bg-white rounded-2xl shadow-sm border">
            <div className="size-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Brain className="size-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Our Solution</h3>
            <p className="text-slate-600">
              AI-powered platform that aggregates community data, identifies urgent needs, and intelligently matches volunteers to tasks.
            </p>
          </div>
          <div className="p-8 bg-white rounded-2xl shadow-sm border">
            <div className="size-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="size-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">The Impact</h3>
            <p className="text-slate-600">
              Faster response times, optimized resource allocation, and measurable social impact through data-driven decision making.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="size-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Aggregate Data</h3>
            <p className="text-slate-600">
              Collect and centralize community needs from multiple sources into a unified dashboard.
            </p>
          </div>
          <div className="text-center">
            <div className="size-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
            <p className="text-slate-600">
              Machine learning identifies patterns, predicts demand, and prioritizes urgent cases automatically.
            </p>
          </div>
          <div className="text-center">
            <div className="size-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
            <p className="text-slate-600">
              Intelligent algorithms match volunteers to tasks based on skills, location, and availability.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Impact?</h2>
          <p className="text-xl mb-8 text-blue-50">
            Join leading NGOs using ReliefSync AI to reach more people faster.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-xl hover:shadow-2xl transition-all"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="size-5 text-white" />
              </div>
              <span className="font-semibold">ReliefSync AI</span>
            </div>
            <p className="text-sm text-slate-500">© 2026 ReliefSync AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

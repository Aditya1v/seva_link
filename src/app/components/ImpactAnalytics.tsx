import { TrendingUp, Users, Clock, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const monthlyData = [
  { month: 'Jan', tasksCompleted: 145, volunteersActive: 89, peopleHelped: 1240 },
  { month: 'Feb', tasksCompleted: 168, volunteersActive: 102, peopleHelped: 1580 },
  { month: 'Mar', tasksCompleted: 192, volunteersActive: 128, peopleHelped: 1920 },
  { month: 'Apr', tasksCompleted: 234, volunteersActive: 156, peopleHelped: 2340 },
];

const categoryData = [
  { name: 'Medical', value: 35, color: '#ef4444' },
  { name: 'Food', value: 28, color: '#f59e0b' },
  { name: 'Shelter', value: 18, color: '#3b82f6' },
  { name: 'Education', value: 12, color: '#8b5cf6' },
  { name: 'Other', value: 7, color: '#6b7280' },
];

const responseTimeData = [
  { period: 'Before AI', avgTime: 6.8, label: 'Before' },
  { period: 'After AI', avgTime: 2.4, label: 'After' },
];

const efficiencyData = [
  { metric: 'Response Time', before: 6.8, after: 2.4, improvement: 65 },
  { metric: 'Match Accuracy', before: 72, after: 94, improvement: 31 },
  { metric: 'Volunteer Utilization', before: 58, after: 87, improvement: 50 },
];

export function ImpactAnalytics() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Impact Analytics</h1>
        <p className="text-slate-600">Measure and visualize the real-world impact of your operations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="size-6 text-green-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <ArrowUp className="size-4" />
              <span>+28%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Tasks Completed</p>
          <p className="text-3xl font-bold">739</p>
          <p className="text-xs text-slate-500 mt-1">This quarter</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="size-6 text-blue-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <ArrowUp className="size-4" />
              <span>+42%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">People Helped</p>
          <p className="text-3xl font-bold">7,080</p>
          <p className="text-xs text-slate-500 mt-1">This quarter</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="size-6 text-purple-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <ArrowDown className="size-4" />
              <span>-65%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Avg Response Time</p>
          <p className="text-3xl font-bold">2.4h</p>
          <p className="text-xs text-slate-500 mt-1">Down from 6.8h</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="size-6 text-orange-600" />
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <ArrowUp className="size-4" />
              <span>+31%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Match Accuracy</p>
          <p className="text-3xl font-bold">94%</p>
          <p className="text-xs text-slate-500 mt-1">AI-powered matching</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Monthly Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="tasksCompleted" stroke="#3b82f6" strokeWidth={2} name="Tasks Completed" />
              <Line type="monotone" dataKey="volunteersActive" stroke="#8b5cf6" strokeWidth={2} name="Active Volunteers" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Requests by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Before vs After Comparison */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Impact Comparison: Before vs After AI</h3>
            <p className="text-sm text-slate-600">Efficiency improvements since implementing ReliefSync AI</p>
          </div>
          <div className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-medium">
            Average +48% improvement
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={efficiencyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="metric" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Bar dataKey="before" fill="#94a3b8" name="Before AI" radius={[8, 8, 0, 0]} />
            <Bar dataKey="after" fill="#3b82f6" name="After AI" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Efficiency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {efficiencyData.map((item, idx) => (
          <div key={idx} className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-2xl border">
            <h4 className="font-semibold mb-4">{item.metric}</h4>
            <div className="flex items-end gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Before</p>
                <p className="text-2xl font-bold text-slate-400">
                  {item.metric === 'Response Time' ? `${item.before}h` : `${item.before}%`}
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <ArrowUp className="size-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">After</p>
                <p className="text-2xl font-bold text-blue-600">
                  {item.metric === 'Response Time' ? `${item.after}h` : `${item.after}%`}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Improvement</span>
                <span className="text-lg font-semibold text-green-600">+{item.improvement}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

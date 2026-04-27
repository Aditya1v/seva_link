import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Brain, LayoutDashboard, Network, TrendingUp, ClipboardList, User, LogOut, PlusCircle, UserCog } from 'lucide-react';
import { useAuth } from '../lib/auth';

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'ngo' || location.pathname.startsWith('/admin');

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/needs', label: 'Community Needs', icon: ClipboardList },
    { path: '/admin/needs/new', label: 'Create Need', icon: PlusCircle },
    { path: '/admin/matching', label: 'Volunteer Matching', icon: Network },
    { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const volunteerLinks = [
    { path: '/volunteer', label: 'My Dashboard', icon: User },
    { path: '/volunteer/profile', label: 'Profile', icon: UserCog },
  ];

  const links = isAdmin ? adminLinks : volunteerLinks;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="size-5 text-white" />
            </div>
            <span className="font-semibold text-lg">ReliefSync AI</span>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="size-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="size-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || (isAdmin ? 'N' : 'V')}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || (isAdmin ? 'NGO User' : 'Volunteer User')}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-colors hover:bg-slate-100"
          >
            <LogOut className="size-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="md:hidden sticky top-0 z-40 border-b bg-white px-4 py-3 flex items-center justify-between">
          <Link to={isAdmin ? '/admin' : '/volunteer'} className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="size-5 text-white" />
            </div>
            <span className="font-semibold">ReliefSync AI</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="rounded-lg border px-3 py-2 text-sm text-slate-600"
          >
            Sign Out
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

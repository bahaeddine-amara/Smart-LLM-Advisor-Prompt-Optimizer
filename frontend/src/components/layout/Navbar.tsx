import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { to: '/analyze',   label: 'Analyze',   icon: '🔍' },
  { to: '/templates', label: 'Templates', icon: '📚' },
  { to: '/ab-test',   label: 'A/B Test',  icon: '⚡' },
  { to: '/history',   label: 'History',   icon: '📋' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="glass border-b border-white/8 px-6 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-sm">🧠</span>
          </div>
          <span className="text-sm font-bold gradient-text hidden sm:block">Smart LLM Advisor</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  active
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-sm">{icon}</span>
                <span className="hidden md:block">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* User */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-slate-300">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

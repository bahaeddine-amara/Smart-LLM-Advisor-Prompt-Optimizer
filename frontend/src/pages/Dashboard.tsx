import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { promptService } from '../services/promptService';
import type { StatisticsDto } from '../services/promptService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

const CATEGORY_CONFIG: Record<string, { color: string; bar: string; icon: string }> = {
  Programming:        { color: 'text-blue-400',    bar: 'bg-blue-500',    icon: '💻' },
  'Machine Learning': { color: 'text-violet-400',  bar: 'bg-violet-500',  icon: '🤖' },
  DevOps:             { color: 'text-orange-400',  bar: 'bg-orange-500',  icon: '⚙️' },
  Writing:            { color: 'text-emerald-400', bar: 'bg-emerald-500', icon: '✍️' },
  Research:           { color: 'text-purple-400',  bar: 'bg-purple-500',  icon: '🔬' },
  General:            { color: 'text-slate-400',   bar: 'bg-slate-500',   icon: '💬' },
};

export default function Dashboard() {
  const [stats, setStats] = useState<StatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    promptService.getStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Prompts Analyzed', value: stats.totalPrompts.toString(),            sub: 'total',           icon: '📊', g: 'from-blue-500/20 to-cyan-500/10',    b: 'border-blue-500/20',    t: 'text-blue-400' },
    { label: 'Tokens Saved',     value: stats.totalTokensSaved.toLocaleString(), sub: 'via optimization', icon: '⚡', g: 'from-emerald-500/20 to-teal-500/10', b: 'border-emerald-500/20', t: 'text-emerald-400' },
    { label: 'Money Saved',      value: `$${stats.totalMoneySaved.toFixed(6)}`,  sub: 'across models',   icon: '💸', g: 'from-yellow-500/20 to-orange-500/10', b: 'border-yellow-500/20',  t: 'text-yellow-400' },
    { label: 'Avg Quality',      value: `${stats.averageQualityScore}`,           sub: 'out of 100',      icon: '🎯', g: 'from-purple-500/20 to-pink-500/10',  b: 'border-purple-500/20',  t: 'text-purple-400' },
  ] : [];

  const totalCatCount = stats ? Object.values(stats.categoryBreakdown ?? {}).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-1">Overview</p>
          <h1 className="text-2xl font-bold text-white">
            Hey, <span className="gradient-text">{user?.username}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Your AI prompt intelligence workspace.</p>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl h-32 shimmer" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {statCards.map(({ label, value, sub, icon, g, b, t }) => (
              <div key={label}
                className={`glass rounded-2xl p-5 bg-gradient-to-br ${g} border ${b} hover:border-white/20 transition-all`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">{icon}</span>
                  <span className={`text-xs ${t} opacity-60`}>{sub}</span>
                </div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick actions */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: '/analyze',   icon: '🔍', label: 'Analyze Prompt',  desc: 'Quality score, cost & recommendations', primary: true },
                { to: '/templates', icon: '📚', label: 'Templates',        desc: 'Start from 20+ ready-made prompts',      primary: false },
                { to: '/ab-test',   icon: '⚡', label: 'A/B Test',         desc: 'Compare two prompts head-to-head',        primary: false },
                { to: '/history',   icon: '📋', label: 'History',          desc: 'Browse and search past analyses',         primary: false },
              ].map(({ to, icon, label, desc, primary }) => (
                <Link key={to} to={to}
                  className={`glass rounded-2xl p-4 flex items-start gap-3 hover:border-white/20 transition-all group ${primary ? 'border-indigo-500/30 bg-indigo-500/5' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${primary ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30' : 'bg-white/5'}`}>
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                  <span className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors self-center">→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Category Breakdown</h2>
            <div className="glass glass-strong rounded-2xl p-5">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <div key={i} className="h-6 shimmer rounded" />)}
                </div>
              ) : totalCatCount === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">📭</div>
                  <div className="text-sm text-slate-500">No prompts yet</div>
                  <Link to="/analyze" className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block">
                    Analyze your first →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats?.categoryBreakdown ?? {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, count]) => {
                      const cfg = CATEGORY_CONFIG[cat] ?? CATEGORY_CONFIG['General'];
                      const pct = totalCatCount > 0 ? Math.round((count / totalCatCount) * 100) : 0;
                      return (
                        <div key={cat}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-400 flex items-center gap-1.5">
                              {cfg.icon} {cat}
                            </span>
                            <span className={`text-xs font-semibold ${cfg.color}`}>{count}</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  <div className="pt-2 border-t border-white/5 text-xs text-slate-600 text-right">
                    {totalCatCount} total prompt{totalCatCount !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-5 glass rounded-xl px-4 py-2.5 flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-500">
            Powered by <span className="text-indigo-400">Ollama</span> running locally — all analysis stays on your machine.
          </span>
        </div>
      </main>
    </div>
  );
}

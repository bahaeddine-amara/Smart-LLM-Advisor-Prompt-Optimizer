import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { promptService } from '../services/promptService';
import type { PromptDto } from '../services/promptService';
import Navbar from '../components/layout/Navbar';

const CATEGORIES = ['', 'Programming', 'Machine Learning', 'DevOps', 'Writing', 'Research', 'General'];

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  Programming:        { color: 'text-blue-400',    bg: 'bg-blue-500/15 border-blue-500/30',     icon: '💻' },
  'Machine Learning': { color: 'text-violet-400',  bg: 'bg-violet-500/15 border-violet-500/30', icon: '🤖' },
  DevOps:             { color: 'text-orange-400',  bg: 'bg-orange-500/15 border-orange-500/30', icon: '⚙️' },
  Writing:            { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: '✍️' },
  Research:           { color: 'text-purple-400',  bg: 'bg-purple-500/15 border-purple-500/30', icon: '🔬' },
  General:            { color: 'text-slate-400',   bg: 'bg-slate-500/15 border-slate-500/30',   icon: '💬' },
};

function QualityBadge({ score }: { score: number }) {
  const cls = score >= 75 ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
            : score >= 50 ? 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30'
            : 'text-red-400 bg-red-500/15 border-red-500/30';
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cls}`}>{score}/100</span>;
}

export default function History() {
  const [prompts, setPrompts]   = useState<PromptDto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory]     = useState('');

  const loadHistory = useCallback(async (p: number, cat: string, q: string) => {
    setLoading(true);
    try {
      const res = await promptService.getHistory(p, 10, cat || undefined, q || undefined);
      setPrompts(res.data.content);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadHistory(0, category, search); }, [category, search, loadHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this prompt?')) return;
    setDeleting(id);
    try { await promptService.delete(id); loadHistory(page, category, search); }
    catch { alert('Failed to delete.'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        <div className="mb-8">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-1">History</p>
          <h1 className="text-2xl font-bold text-white">Prompt <span className="gradient-text">Archive</span></h1>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search your prompts…"
              className="flex-1 bg-black/30 text-slate-200 placeholder-slate-600 border border-white/8 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            <button type="submit"
              className="px-4 py-2 glass rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition-all">
              Search
            </button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); setSearchInput(''); }}
                className="px-3 py-2 glass rounded-xl text-xs text-slate-500 hover:text-white transition-all">
                ✕
              </button>
            )}
          </form>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="bg-black/30 text-slate-300 border border-white/8 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-all">
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c || 'All Categories'}</option>
            ))}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl h-20 shimmer" />)}
          </div>
        ) : prompts.length === 0 ? (
          <div className="glass glass-strong rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">{search || category ? '🔍' : '📭'}</div>
            <div className="text-white font-semibold mb-2">
              {search || category ? 'No matching prompts' : 'No prompts yet'}
            </div>
            <div className="text-slate-400 text-sm mb-5">
              {search || category ? 'Try a different search or category filter.' : 'Start analyzing prompts to build your history.'}
            </div>
            {!search && !category && (
              <Link to="/analyze" className="btn-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl inline-block">
                Analyze Your First Prompt
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {prompts.map(p => {
              const cfg = CATEGORY_CONFIG[p.category] ?? CATEGORY_CONFIG['General'];
              const isExpanded = expanded === p.id;
              return (
                <div key={p.id} className="glass rounded-2xl hover:border-white/15 transition-all">
                  <div className="p-4 flex items-start gap-3 cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : p.id)}>
                    {/* Category icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border ${cfg.bg}`}>
                      {cfg.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm line-clamp-2 mb-2">{p.originalPrompt}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.category && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.color}`}>
                            {p.category}
                          </span>
                        )}
                        {p.qualityScore != null && <QualityBadge score={p.qualityScore} />}
                        {p.tokensBefore != null && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                            {p.tokensBefore} tokens
                          </span>
                        )}
                        {p.tokensAfter != null && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-medium">
                            → {p.tokensAfter} optimized
                          </span>
                        )}
                        {p.recommendedModel && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">
                            🏆 {p.recommendedModel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span className="text-xs text-slate-600">
                        {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-xs text-slate-600">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-3">
                      <div className="glass rounded-xl p-3">
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Original Prompt</div>
                        <p className="text-sm text-slate-200 whitespace-pre-wrap">{p.originalPrompt}</p>
                      </div>
                      {p.optimizedPrompt && (
                        <div className="glass rounded-xl p-3">
                          <div className="text-xs text-teal-500 font-medium uppercase tracking-wider mb-2">Optimized Prompt</div>
                          <p className="text-sm text-slate-200 whitespace-pre-wrap">{p.optimizedPrompt}</p>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                          className="text-xs text-slate-600 hover:text-red-400 transition-colors disabled:opacity-40">
                          {deleting === p.id ? 'Deleting…' : '🗑 Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button onClick={() => loadHistory(page - 1, category, search)} disabled={page === 0}
              className="px-4 py-2 glass rounded-xl text-xs text-slate-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30">
              ← Prev
            </button>
            <span className="text-xs text-slate-500">{page + 1} / {totalPages}</span>
            <button onClick={() => loadHistory(page + 1, category, search)} disabled={page >= totalPages - 1}
              className="px-4 py-2 glass rounded-xl text-xs text-slate-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30">
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { promptService } from '../services/promptService';
import type { TemplateDto } from '../services/promptService';
import Navbar from '../components/layout/Navbar';

const CATEGORIES = ['All', 'Programming', 'Machine Learning', 'DevOps', 'Writing', 'Research', 'General'];

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  Programming:        { color: 'text-blue-400',    bg: 'bg-blue-500/15 border-blue-500/30',     icon: '💻' },
  'Machine Learning': { color: 'text-violet-400',  bg: 'bg-violet-500/15 border-violet-500/30', icon: '🤖' },
  DevOps:             { color: 'text-orange-400',  bg: 'bg-orange-500/15 border-orange-500/30', icon: '⚙️' },
  Writing:            { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: '✍️' },
  Research:           { color: 'text-purple-400',  bg: 'bg-purple-500/15 border-purple-500/30', icon: '🔬' },
  General:            { color: 'text-slate-400',   bg: 'bg-slate-500/15 border-slate-500/30',   icon: '💬' },
};

export default function Templates() {
  const [templates, setTemplates]   = useState<TemplateDto[]>([]);
  const [filtered, setFiltered]     = useState<TemplateDto[]>([]);
  const [activeCategory, setActive] = useState('All');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [copied, setCopied]         = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    promptService.getTemplates()
      .then(res => { setTemplates(res.data); setFiltered(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = templates;
    if (activeCategory !== 'All') result = result.filter(t => t.category === activeCategory);
    if (search.trim()) result = result.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );
    setFiltered(result);
  }, [activeCategory, search, templates]);

  const handleCopy = (template: TemplateDto) => {
    navigator.clipboard.writeText(template.prompt);
    setCopied(template.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleUse = (template: TemplateDto) => {
    sessionStorage.setItem('templatePrompt', template.prompt);
    navigate('/analyze');
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-1">Library</p>
          <h1 className="text-2xl font-bold text-white">Prompt <span className="gradient-text">Templates</span></h1>
          <p className="text-slate-400 mt-1 text-sm">Ready-to-use templates for every use case. Click <strong className="text-white">Use Template</strong> to load it into the analyzer.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="flex-1 bg-black/30 text-slate-200 placeholder-slate-600 border border-white/8 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActive(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40'
                  : 'glass text-slate-400 hover:text-white hover:border-white/15'
              }`}>
              {cat === 'All' ? '✦ All' : `${CATEGORY_CONFIG[cat]?.icon} ${cat}`}
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-xs text-slate-600 mb-4">{filtered.length} template{filtered.length !== 1 ? 's' : ''}</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="glass rounded-2xl h-52 shimmer" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-white font-medium mb-1">No templates found</div>
            <div className="text-slate-500 text-sm">Try a different search or category</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(template => {
              const cfg = CATEGORY_CONFIG[template.category] ?? CATEGORY_CONFIG['General'];
              return (
                <div key={template.id} className="glass glass-strong rounded-2xl p-5 flex flex-col hover:border-white/15 transition-all group">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cfg.icon}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.color}`}>
                        {template.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-white font-semibold text-sm mb-1">{template.title}</h3>
                  <p className="text-slate-400 text-xs mb-3 leading-relaxed">{template.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {template.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-slate-500">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Preview */}
                  <div className="glass rounded-lg p-3 mb-4 flex-1">
                    <p className="text-xs text-slate-500 line-clamp-3 font-mono leading-relaxed">
                      {template.prompt}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => handleCopy(template)}
                      className="flex-1 text-xs py-2 rounded-lg glass hover:border-white/20 text-slate-400 hover:text-white transition-all">
                      {copied === template.id ? '✅ Copied!' : '📋 Copy'}
                    </button>
                    <button onClick={() => handleUse(template)}
                      className="flex-1 text-xs py-2 rounded-lg btn-primary text-white font-medium">
                      Use Template →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

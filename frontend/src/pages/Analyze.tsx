import { useState } from 'react';
import { promptService } from '../services/promptService';
import type { AnalyzeResponse, OptimizeResponse, ScoreDetailResponse } from '../services/promptService';
import Navbar from '../components/layout/Navbar';

// ── Config ───────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  Programming:        { color: 'text-blue-400',    bg: 'bg-blue-500/15 border-blue-500/30',     icon: '💻' },
  'Machine Learning': { color: 'text-violet-400',  bg: 'bg-violet-500/15 border-violet-500/30', icon: '🤖' },
  DevOps:             { color: 'text-orange-400',  bg: 'bg-orange-500/15 border-orange-500/30', icon: '⚙️' },
  Writing:            { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30',icon: '✍️' },
  Research:           { color: 'text-purple-400',  bg: 'bg-purple-500/15 border-purple-500/30', icon: '🔬' },
  General:            { color: 'text-slate-400',   bg: 'bg-slate-500/15 border-slate-500/30',   icon: '💬' },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171';
  const center = size / 2;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" style={{ position: 'absolute' }}>
        <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="text-center z-10">
        <div className="text-xl font-bold text-white leading-none">{score}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">/ 100</div>
      </div>
    </div>
  );
}

function DimBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-semibold text-white">{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Analyze() {
  const [promptText, setPromptText]       = useState(() => {
    const tpl = sessionStorage.getItem('templatePrompt');
    if (tpl) { sessionStorage.removeItem('templatePrompt'); return tpl; }
    return '';
  });
  const [analyzing, setAnalyzing]         = useState(false);
  const [scoringDetail, setScoringDetail] = useState(false);
  const [optimizing, setOptimizing]       = useState(false);
  const [saving, setSaving]               = useState(false);

  const [analysis, setAnalysis]         = useState<AnalyzeResponse | null>(null);
  const [scoreDetail, setScoreDetail]   = useState<ScoreDetailResponse | null>(null);
  const [optimization, setOptimization] = useState<OptimizeResponse | null>(null);
  const [error, setError]               = useState('');
  const [saved, setSaved]               = useState(false);
  const [activeTab, setActiveTab]       = useState<'overview' | 'detail'>('overview');

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!promptText.trim()) return;
    setError(''); setAnalyzing(true); setAnalysis(null);
    setScoreDetail(null); setOptimization(null); setSaved(false);
    try {
      const res = await promptService.analyze(promptText);
      setAnalysis(res.data);
      setActiveTab('overview');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; code?: string };
      setError(!e.response
        ? e.code === 'ECONNABORTED' ? 'Timed out — try again' : 'Cannot reach backend on port 8081'
        : e.response.data?.error || 'Analysis failed');
    } finally { setAnalyzing(false); }
  };

  const handleScoreDetail = async () => {
    if (!promptText.trim()) return;
    setScoringDetail(true);
    try {
      const res = await promptService.scoreDetail(promptText);
      setScoreDetail(res.data);
      setActiveTab('detail');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Scoring failed');
    } finally { setScoringDetail(false); }
  };

  const handleOptimize = async (mode: string) => {
    if (!promptText.trim()) return;
    setError(''); setOptimizing(true);
    try {
      const res = await promptService.optimize(promptText, mode);
      setOptimization(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Optimization failed');
    } finally { setOptimizing(false); }
  };

  const handleSave = async () => {
    if (!analysis) return;
    setSaving(true);
    try {
      await promptService.save({
        originalPrompt: promptText,
        optimizedPrompt: optimization?.optimizedPrompt,
        category: analysis.category,
        qualityScore: analysis.qualityScore,
        tokensBefore: analysis.estimatedTokens,
        tokensAfter: optimization?.tokensAfter,
        costBefore: analysis.costEstimates['GPT-5'],
        costAfter: optimization?.costAfter ?? null,
        recommendedModel: analysis.recommendations.bestOverall,
        optimizationMode: optimization ? 'SAVED' : null,
      });
      setSaved(true);
    } catch { setError('Failed to save'); }
    finally { setSaving(false); }
  };

  const cat = analysis ? (CATEGORY_CONFIG[analysis.category] ?? CATEGORY_CONFIG['General']) : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-1">Prompt Lab</p>
          <h1 className="text-2xl font-bold text-white">Analyze <span className="gradient-text">Your Prompt</span></h1>
        </div>

        {/* Input card */}
        <div className="glass glass-strong rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Your prompt</label>
            <span className="text-xs text-slate-600">{promptText.length} chars · ~{Math.ceil(promptText.trim().split(/\s+/).filter(Boolean).length * 0.75) || 0} tokens</span>
          </div>
          <textarea
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            rows={5}
            className="w-full bg-black/30 text-slate-200 placeholder-slate-600 border border-white/8 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            placeholder="Type or paste your prompt here… (Ctrl+Enter to analyze)"
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAnalyze(); }}
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-slate-600">Powered by Ollama · local &amp; private</p>
            <div className="flex gap-2">
              <button onClick={handleScoreDetail} disabled={scoringDetail || !promptText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium glass hover:border-white/20 text-slate-300 hover:text-white transition-all disabled:opacity-40">
                {scoringDetail ? <><Spinner /> Scoring…</> : '📐 Deep Score'}
              </button>
              <button onClick={handleAnalyze} disabled={analyzing || !promptText.trim()}
                className="btn-primary flex items-center gap-1.5 text-white font-semibold px-5 py-2 rounded-xl text-sm">
                {analyzing ? <><Spinner /> Analyzing…</> : '🔍 Analyze'}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="glass rounded-xl px-4 py-3 mb-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {(analysis || scoreDetail) && (
          <div className="space-y-4">

            {/* Tab bar */}
            <div className="flex gap-1 glass rounded-xl p-1 w-fit">
              {(['overview', 'detail'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  disabled={tab === 'detail' && !scoreDetail}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize disabled:opacity-30 ${
                    activeTab === tab ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
                  }`}>
                  {tab === 'overview' ? '📊 Overview' : '📐 Score Detail'}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && analysis && cat && (
              <>
                {/* Top row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass glass-strong rounded-2xl p-5 text-center">
                    <div className="text-2xl mb-2">{cat.icon}</div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${cat.bg} ${cat.color}`}>
                      {analysis.category}
                    </span>
                    <div className="text-xs text-slate-500 mt-2">Category</div>
                  </div>
                  <div className="glass glass-strong rounded-2xl p-5 flex flex-col items-center justify-center gap-2">
                    <ScoreRing score={analysis.qualityScore} />
                    <div className="text-xs text-slate-500">Quality Score</div>
                  </div>
                  <div className="glass glass-strong rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">{analysis.estimatedTokens}</div>
                    <div className="text-xs text-slate-500">Base Tokens (GPT ref)</div>
                    <div className="text-xs text-slate-600 mt-2">Varies per model ↓</div>
                  </div>
                </div>

                {/* Per-model breakdown */}
                <div className="glass glass-strong rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-yellow-400 to-orange-500" />
                    <h2 className="text-sm font-semibold text-white">Per-Model Cost &amp; Token Breakdown</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(analysis.costEstimates).map(([modelName, cost]) => {
                      const tokens = analysis.tokensByModel?.[modelName] ?? analysis.estimatedTokens;
                      const isRecommended = analysis.recommendations.bestOverall === modelName;
                      return (
                        <div key={modelName}
                          className={`glass rounded-xl p-4 text-center transition-all hover:border-white/20 ${isRecommended ? 'border-indigo-500/40 bg-indigo-500/5' : ''}`}>
                          {isRecommended && (
                            <div className="text-xs text-indigo-400 font-medium mb-1.5">🏆 Best Overall</div>
                          )}
                          <div className="text-xs text-slate-500 font-medium mb-2">{modelName}</div>
                          <div className="text-base font-bold text-white mb-1">${cost.toFixed(8)}</div>
                          <div className="text-xs text-slate-600">{tokens.toLocaleString()} tokens</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="glass glass-strong rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
                    <h2 className="text-sm font-semibold text-white">Recommendations</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Best Overall', key: 'bestOverall', icon: '🥇', desc: 'Highest capability for this task' },
                      { label: 'Best Value',   key: 'bestValue',   icon: '💎', desc: 'Best score per dollar spent' },
                      { label: 'Cheapest',     key: 'cheapest',    icon: '💰', desc: 'Lowest cost option' },
                    ].map(({ label, key, icon, desc }) => (
                      <div key={key} className="glass rounded-xl p-4 text-center hover:border-indigo-500/30 transition-all">
                        <div className="text-xl mb-1">{icon}</div>
                        <div className="text-xs text-slate-500 mb-1">{label}</div>
                        <div className="text-sm font-bold text-indigo-300 mb-1">
                          {analysis.recommendations[key as keyof typeof analysis.recommendations]}
                        </div>
                        <div className="text-xs text-slate-600">{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimize */}
                <div className="glass glass-strong rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-pink-400 to-rose-500" />
                    <h2 className="text-sm font-semibold text-white">Optimize Prompt</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { mode: 'PERFORMANCE', icon: '🎯', label: 'Performance', desc: 'Clearer, more specific rewrite' },
                      { mode: 'ECONOMY',     icon: '💡', label: 'Economy',     desc: 'Maximum token compression' },
                    ].map(({ mode, icon, label, desc }) => (
                      <button key={mode} onClick={() => handleOptimize(mode)} disabled={optimizing}
                        className="glass rounded-xl p-4 text-left hover:border-white/20 transition-all disabled:opacity-40">
                        <div className="text-lg mb-1">{icon}</div>
                        <div className="text-sm font-semibold text-white">{label} Mode</div>
                        <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                      </button>
                    ))}
                  </div>
                  {optimizing && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                      <Spinner /> Rewriting with Ollama…
                    </div>
                  )}
                </div>

                {/* Optimization result */}
                {optimization && (
                  <div className="glass glass-strong rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-teal-400 to-cyan-500" />
                        <h2 className="text-sm font-semibold text-white">Optimized Result</h2>
                      </div>
                      <span className="text-xs text-emerald-400 font-medium bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {optimization.savingsPercent}% tokens saved
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { l: 'Before', v: optimization.tokensBefore, c: 'text-red-400' },
                        { l: 'After',  v: optimization.tokensAfter,  c: 'text-emerald-400' },
                        { l: 'Saved',  v: optimization.tokensBefore - optimization.tokensAfter, c: 'text-yellow-400' },
                      ].map(({ l, v, c }) => (
                        <div key={l} className="glass rounded-xl p-3 text-center">
                          <div className={`text-2xl font-bold ${c}`}>{v}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Tokens {l}</div>
                        </div>
                      ))}
                    </div>
                    <div className="glass rounded-xl p-4">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Optimized Prompt</div>
                      <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{optimization.optimizedPrompt}</p>
                    </div>
                  </div>
                )}

                {/* Save */}
                <div className="flex justify-end">
                  {saved ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Saved to history
                    </div>
                  ) : (
                    <button onClick={handleSave} disabled={saving}
                      className="px-5 py-2 rounded-xl text-xs font-medium glass hover:border-white/20 text-slate-300 hover:text-white transition-all disabled:opacity-40">
                      {saving ? 'Saving…' : '💾 Save to History'}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* DETAIL TAB */}
            {activeTab === 'detail' && scoreDetail && (
              <div className="glass glass-strong rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-semibold mb-0.5">5-Dimension Score Breakdown</h2>
                    <p className="text-xs text-slate-500">Detailed analysis of your prompt quality</p>
                  </div>
                  <div className="text-center">
                    <ScoreRing score={scoreDetail.overall} size={80} />
                    <div className="text-xs text-slate-500 mt-1">Overall</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <DimBar label="Clarity — Is the goal unambiguous?"            value={scoreDetail.clarity}       color="bg-blue-500" />
                  <DimBar label="Specificity — Are details and scope defined?"   value={scoreDetail.specificity}   color="bg-violet-500" />
                  <DimBar label="Context — Is background info provided?"         value={scoreDetail.context}       color="bg-purple-500" />
                  <DimBar label="Actionability — Can AI act on this directly?"   value={scoreDetail.actionability} color="bg-emerald-500" />
                  <DimBar label="Conciseness — Free of filler and redundancy?"   value={scoreDetail.conciseness}   color="bg-teal-500" />
                </div>

                {scoreDetail.suggestion && (
                  <div className="glass rounded-xl p-4 border border-yellow-500/20 bg-yellow-500/5">
                    <div className="text-xs font-medium text-yellow-400 mb-1">💡 Top Improvement</div>
                    <p className="text-sm text-slate-200">{scoreDetail.suggestion}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

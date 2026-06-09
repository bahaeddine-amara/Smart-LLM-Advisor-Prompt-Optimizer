import { useState } from 'react';
import { promptService } from '../services/promptService';
import type { AbTestResponse } from '../services/promptService';
import Navbar from '../components/layout/Navbar';

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export default function AbTest() {
  const [promptA, setPromptA] = useState('');
  const [promptB, setPromptB] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult]   = useState<AbTestResponse | null>(null);
  const [error, setError]     = useState('');

  const handleRun = async () => {
    if (!promptA.trim() || !promptB.trim()) return;
    setError(''); setRunning(true); setResult(null);
    try {
      const res = await promptService.abTest(promptA, promptB);
      setResult(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'A/B test failed. Make sure Ollama is running.');
    } finally { setRunning(false); }
  };

  const winnerColor = result?.winner === 'A'
    ? 'border-emerald-500/50 bg-emerald-500/5'
    : result?.winner === 'B'
    ? 'border-emerald-500/50 bg-emerald-500/5'
    : '';

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-1">Experiment</p>
          <h1 className="text-2xl font-bold text-white">A/B <span className="gradient-text">Prompt Testing</span></h1>
          <p className="text-slate-400 mt-1 text-sm">Run two prompts through Ollama and compare their outputs side by side.</p>
        </div>

        {/* Input area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            { label: 'Prompt A', value: promptA, set: setPromptA, accent: 'border-blue-500/40', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
            { label: 'Prompt B', value: promptB, set: setPromptB, accent: 'border-purple-500/40', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
          ].map(({ label, value, set, accent, badge }) => (
            <div key={label} className="glass glass-strong rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge}`}>{label}</span>
                <span className="text-xs text-slate-600">{value.length} chars</span>
              </div>
              <textarea
                value={value}
                onChange={e => set(e.target.value)}
                rows={6}
                placeholder={`Enter prompt ${label.slice(-1)} here…`}
                className={`w-full bg-black/30 text-slate-200 placeholder-slate-600 border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 transition-all ${accent} focus:ring-current`}
              />
            </div>
          ))}
        </div>

        {/* Run button */}
        <div className="flex items-center justify-center mb-6">
          <button onClick={handleRun} disabled={running || !promptA.trim() || !promptB.trim()}
            className="btn-primary flex items-center gap-2 text-white font-semibold px-8 py-3 rounded-xl">
            {running ? <><Spinner /> Running both prompts…</> : '⚡ Run A/B Test'}
          </button>
        </div>

        {running && (
          <div className="glass rounded-xl px-5 py-4 mb-4 text-center">
            <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
              <Spinner />
              <span>Running Prompt A… then Prompt B… This may take 1–3 minutes total.</span>
            </div>
            <div className="mt-3 w-full bg-white/5 rounded-full h-1">
              <div className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shimmer w-full" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass rounded-xl px-4 py-3 mb-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Verdict */}
            <div className="glass glass-strong rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black ${
                  result.winner === 'TIE'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {result.winner === 'TIE' ? '🤝' : result.winner === 'A' ? 'A' : 'B'}
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    {result.winner === 'TIE' ? 'It\'s a Tie' : `Prompt ${result.winner} Wins`}
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5">{result.verdict}</p>
                </div>
                <div className="sm:ml-auto flex gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-400">{result.qualityA}</div>
                    <div className="text-xs text-slate-500">Score A</div>
                  </div>
                  <div className="w-px bg-white/8" />
                  <div>
                    <div className="text-lg font-bold text-purple-400">{result.qualityB}</div>
                    <div className="text-xs text-slate-500">Score B</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side-by-side outputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: 'A', prompt: result.promptA, output: result.outputA,
                  tokens: result.tokensA, quality: result.qualityA,
                  isWinner: result.winner === 'A',
                  badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                  accentClass: result.winner === 'A' ? 'border-emerald-500/40' : '',
                },
                {
                  label: 'B', prompt: result.promptB, output: result.outputB,
                  tokens: result.tokensB, quality: result.qualityB,
                  isWinner: result.winner === 'B',
                  badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                  accentClass: result.winner === 'B' ? 'border-emerald-500/40' : '',
                },
              ].map(({ label, prompt, output, tokens, quality, isWinner, badgeClass, accentClass }) => (
                <div key={label} className={`glass glass-strong rounded-2xl p-5 transition-all ${accentClass}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                      Prompt {label}
                    </span>
                    {isWinner && (
                      <span className="text-xs text-emerald-400 font-medium bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        ✓ Winner
                      </span>
                    )}
                    <div className="ml-auto flex gap-3 text-xs text-slate-500">
                      <span>{tokens} tokens</span>
                      <span>score: {quality}</span>
                    </div>
                  </div>

                  {/* Prompt used */}
                  <div className="glass rounded-lg p-3 mb-3">
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1.5">Prompt</div>
                    <p className="text-xs text-slate-400 line-clamp-3">{prompt}</p>
                  </div>

                  {/* Output */}
                  <div className="glass rounded-lg p-3">
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1.5">Output</div>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {output}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

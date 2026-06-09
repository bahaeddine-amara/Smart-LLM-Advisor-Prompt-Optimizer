import { useState } from 'react';
import { promptService } from '../services/promptService';
import type { AnalyzeResponse, OptimizeResponse } from '../services/promptService';
import Navbar from '../components/layout/Navbar';

export default function Analyze() {
  const [promptText, setPromptText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [optimization, setOptimization] = useState<OptimizeResponse | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleAnalyze = async () => {
    if (!promptText.trim()) return;
    setError('');
    setAnalyzing(true);
    setAnalysis(null);
    setOptimization(null);
    setSaved(false);
    try {
      const res = await promptService.analyze(promptText);
      setAnalysis(res.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; code?: string; message?: string };
      if (!axiosErr.response) {
        setError(
          axiosErr.code === 'ECONNABORTED'
            ? 'Analysis timed out. The first run can take 1–2 minutes — try again and wait.'
            : 'Cannot reach the backend. Make sure it is running on port 8081.'
        );
      } else {
        setError(axiosErr.response.data?.error || 'Analysis failed.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOptimize = async (mode: string) => {
    if (!promptText.trim()) return;
    setError('');
    setOptimizing(true);
    try {
      const res = await promptService.optimize(promptText, mode);
      setOptimization(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Optimization failed.');
    } finally {
      setOptimizing(false);
    }
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
        costAfter: optimization ? optimization.costAfter : null,
        recommendedModel: analysis.recommendations.bestOverall,
        optimizationMode: optimization ? 'SAVED' : null,
      });
      setSaved(true);
    } catch (err: any) {
      setError('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const categoryColors: Record<string, string> = {
    Programming: 'bg-blue-100 text-blue-700',
    Writing: 'bg-green-100 text-green-700',
    Research: 'bg-purple-100 text-purple-700',
    General: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">✨ Analyze Prompt</h1>

        {/* Input */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your prompt
          </label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Type or paste your prompt here..."
          />
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !promptText.trim()}
            className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {analyzing ? '⏳ Analyzing (may take 1–2 min)...' : '🔍 Analyze'}
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Uses local Ollama — first request loads the model and can take up to 2 minutes.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">📊 Analysis Results</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-bold text-indigo-600">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${categoryColors[analysis.category] || 'bg-gray-100 text-gray-700'}`}>
                      {analysis.category}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Category</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">{analysis.qualityScore}</div>
                  <div className="text-xs text-gray-500 mt-1">Quality Score / 100</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${analysis.qualityScore}%` }}
                    />
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">{analysis.estimatedTokens}</div>
                  <div className="text-xs text-gray-500 mt-1">Estimated Tokens</div>
                </div>
              </div>

              {/* Cost Estimates */}
              <h3 className="text-sm font-semibold text-gray-600 mb-3">💸 Cost Estimates</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {Object.entries(analysis.costEstimates).map(([model, cost]) => (
                  <div key={model} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500 font-medium">{model}</div>
                    <div className="text-lg font-bold text-gray-800 mt-1">
                      ${cost.toFixed(6)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <h3 className="text-sm font-semibold text-gray-600 mb-3">🏆 Recommendations</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Best Overall', key: 'bestOverall', emoji: '🥇' },
                  { label: 'Best Value', key: 'bestValue', emoji: '💎' },
                  { label: 'Cheapest', key: 'cheapest', emoji: '💰' },
                ].map(({ label, key, emoji }) => (
                  <div key={key} className="bg-indigo-50 rounded-xl p-3 text-center">
                    <div className="text-xl">{emoji}</div>
                    <div className="text-xs text-gray-500 mt-1">{label}</div>
                    <div className="text-sm font-bold text-indigo-700 mt-1">
                      {analysis.recommendations[key as keyof typeof analysis.recommendations]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimize Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">⚙️ Optimize Prompt</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => handleOptimize('PERFORMANCE')}
                  disabled={optimizing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                >
                  {optimizing ? '⏳ Optimizing...' : '🎯 Performance Mode'}
                </button>
                <button
                  onClick={() => handleOptimize('ECONOMY')}
                  disabled={optimizing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                >
                  {optimizing ? '⏳ Optimizing...' : '💡 Economy Mode'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Performance: precise rewrite | Economy: maximum compression
              </p>
            </div>

            {/* Optimization Results */}
            {optimization && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">✅ Optimization Results</h2>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-red-50 rounded-xl">
                    <div className="text-xl font-bold text-red-500">{optimization.tokensBefore}</div>
                    <div className="text-xs text-gray-500">Tokens Before</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="text-xl font-bold text-green-600">{optimization.tokensAfter}</div>
                    <div className="text-xs text-gray-500">Tokens After</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-xl">
                    <div className="text-xl font-bold text-yellow-600">{optimization.savingsPercent}%</div>
                    <div className="text-xs text-gray-500">Tokens Saved</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs font-medium text-gray-500 mb-2">OPTIMIZED PROMPT:</div>
                  <p className="text-gray-800 text-sm whitespace-pre-wrap">{optimization.optimizedPrompt}</p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              {saved ? (
                <div className="text-green-600 font-medium">✅ Saved to history!</div>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : '💾 Save to History'}
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
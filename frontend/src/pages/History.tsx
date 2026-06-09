import { useEffect, useState } from 'react';
import { promptService } from '../services/promptService';
import type { PromptDto } from '../services/promptService';
import Navbar from '../components/layout/Navbar';

export default function History() {
  const [prompts, setPrompts] = useState<PromptDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadHistory = async (p = 0) => {
    setLoading(true);
    try {
      const res = await promptService.getHistory(p, 10);
      setPrompts(res.data.content);
      setTotalPages(res.data.totalPages);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(0); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this prompt?')) return;
    setDeleting(id);
    try {
      await promptService.delete(id);
      loadHistory(page);
    } catch (err) {
      alert('Failed to delete.');
    } finally {
      setDeleting(null);
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
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 Prompt History</h1>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : prompts.length === 0 ? (
          <div className="text-center text-gray-400 py-12 bg-white rounded-2xl border border-gray-200">
            No prompts yet.{' '}
            <a href="/analyze" className="text-indigo-600 hover:underline">Analyze your first prompt!</a>
          </div>
        ) : (
          <div className="space-y-4">
            {prompts.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm line-clamp-2 mb-2">{p.originalPrompt}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {p.category && (
                        <span className={`px-2 py-1 rounded-full font-medium ${categoryColors[p.category] || 'bg-gray-100 text-gray-700'}`}>
                          {p.category}
                        </span>
                      )}
                      {p.qualityScore != null && (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                          Quality: {p.qualityScore}/100
                        </span>
                      )}
                      {p.tokensBefore != null && (
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                          {p.tokensBefore} tokens
                        </span>
                      )}
                      {p.tokensAfter != null && (
                        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                          → {p.tokensAfter} after opt.
                        </span>
                      )}
                      {p.recommendedModel && (
                        <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                          🏆 {p.recommendedModel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="text-red-500 hover:text-red-700 text-xs font-medium transition"
                    >
                      {deleting === p.id ? 'Deleting...' : '🗑 Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => loadHistory(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => loadHistory(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
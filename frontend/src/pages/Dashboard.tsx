import { useEffect, useState } from 'react';
import { promptService } from '../services/promptService';
import type { StatisticsDto } from '../services/promptService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

export default function Dashboard() {
  const [stats, setStats] = useState<StatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    promptService.getStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    {
      label: 'Total Prompts Analyzed',
      value: stats.totalPrompts,
      icon: '📝',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-600',
    },
    {
      label: 'Tokens Saved',
      value: stats.totalTokensSaved.toLocaleString(),
      icon: '⚡',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-600',
    },
    {
      label: 'Money Saved',
      value: `$${stats.totalMoneySaved.toFixed(6)}`,
      icon: '💰',
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Avg Quality Score',
      value: `${stats.averageQualityScore}/100`,
      icon: '⭐',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-600',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your prompt analysis summary.</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading statistics...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => (
              <div
                key={card.label}
                className={`${card.color} border rounded-2xl p-6`}
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <div className={`text-2xl font-bold ${card.textColor}`}>{card.value}</div>
                <div className="text-sm text-gray-600 mt-1">{card.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Quick Actions</h2>
          <div className="flex gap-3 flex-wrap">
            <a
              href="/analyze"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
            >
              ✨ Analyze New Prompt
            </a>
            <a
              href="/history"
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium transition"
            >
              📋 View History
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
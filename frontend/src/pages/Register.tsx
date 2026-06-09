import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(form);
      navigate('/login');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown }; code?: string };
      const data = axiosErr.response?.data;
      if (!axiosErr.response) {
        setError('Cannot reach the backend on port 8081. Make sure it is running.');
      } else if (typeof data === 'object' && data !== null) {
        setError(Object.values(data as Record<string, string>).join(', '));
      } else if (typeof data === 'string') {
        setError(data);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fields: { name: keyof typeof form; label: string; type: string; placeholder: string }[] = [
    { name: 'username', label: 'Username',  type: 'text',     placeholder: 'johndoe' },
    { name: 'email',    label: 'Email',     type: 'email',    placeholder: 'you@example.com' },
    { name: 'password', label: 'Password',  type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl mb-4 shadow-lg shadow-indigo-500/30">
            🧠
          </div>
          <h1 className="text-2xl font-bold text-white">Smart LLM Advisor</h1>
          <p className="text-slate-500 text-sm mt-1">Create your free account</p>
        </div>

        <div className="glass glass-strong rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-slate-400 mb-1.5 capitalize">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full bg-black/30 text-slate-200 placeholder-slate-600 border border-white/8 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  required
                />
              </div>
            ))}

            {error && (
              <div className="glass rounded-xl px-4 py-3 border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-white font-semibold py-2.5 rounded-xl text-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-slate-600 mt-4">
          🔒 Everything runs locally. Your prompts never leave your machine.
        </p>
      </div>
    </div>
  );
}

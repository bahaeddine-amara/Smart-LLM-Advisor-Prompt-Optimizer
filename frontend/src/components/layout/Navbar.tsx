import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-lg font-bold text-indigo-600">
            🤖 Smart LLM Advisor
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition"
            >
              Dashboard
            </Link>
            <Link
              to="/analyze"
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition"
            >
              Analyze
            </Link>
            <Link
              to="/history"
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition"
            >
              History
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">👤 {user?.username}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
// Navigation component - main navigation bar
// Provides links to all major pages

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/dashboard" className="flex items-center px-2 py-2 text-xl font-bold text-blue-600">
              LedgerSmart AI
            </Link>
            <div className="hidden md:flex md:space-x-8">
              <Link to="/dashboard" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link to="/upload" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                Upload
              </Link>
              <Link to="/ai-suggestions" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                AI Suggestions
              </Link>
              <Link to="/reports" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                Reports
              </Link>
              <Link to="/audit" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                Audit
              </Link>
              <Link to="/settings" className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600">
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Subscription badge */}
            {user?.subscription && (
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                user.subscription.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                user.subscription.plan === 'business' ? 'bg-indigo-100 text-indigo-800' :
                user.subscription.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.subscription.plan?.toUpperCase() || 'FREE'}
              </span>
            )}
            <span className="text-gray-700 font-medium">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;


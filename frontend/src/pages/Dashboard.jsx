// Dashboard page - main overview with statistics, recent receipts, and quick actions
// Displays key metrics, charts, and summary cards

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import StatCard from '../components/Cards/StatCard';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Use Promise.allSettled to handle partial failures gracefully
      const [receiptsResult, summaryResult] = await Promise.allSettled([
        api.get('/receipts?page=1&limit=10'),
        api.get('/reports/summary')
      ]);
      
      // Handle receipts
      if (receiptsResult.status === 'fulfilled') {
        setRecentReceipts(receiptsResult.value.data.receipts || []);
      } else {
        console.error('Failed to load receipts:', receiptsResult.reason);
        toast.error('Unable to load recent receipts. Please refresh the page.');
      }
      
      // Handle summary
      if (summaryResult.status === 'fulfilled') {
        setStats(summaryResult.value.data.summary);
      } else {
        console.error('Failed to load summary:', summaryResult.reason);
        toast.error('Unable to load statistics. Some features may be limited.');
        setError('Unable to load dashboard statistics');
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      const errorMessage = error.response?.data?.error || 'Unable to load dashboard data. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-9 w-56 bg-gray-200 rounded-lg animate-pulse mb-3"></div>
            <div className="h-5 w-72 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-8">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="h-16 border-b border-gray-200 flex items-center px-6">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadDashboardData}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const riskColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    flagged: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-base text-gray-600">Welcome back, {user?.name || 'User'}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Receipts"
            value={formatNumber(stats?.totalReceipts || 0)}
            subtitle={stats?.totalReceipts === 1 ? 'receipt' : 'receipts'}
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatCard
            title="Total Amount"
            value={formatCurrency(stats?.totalAmount || 0, user?.currency || 'USD')}
            subtitle="processed"
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="High Risk Items"
            value={formatNumber(stats?.riskCounts?.High || 0)}
            subtitle="require attention"
            icon={
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <StatCard
            title="Plan"
            value={user?.subscription?.plan ? user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1) : 'Free'}
            subtitle={user?.subscription?.status === 'active' ? 'Active' : 'Inactive'}
            icon={
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
        </div>

        {/* Risk Distribution Chart */}
        {stats && (stats.riskCounts?.Low || stats.riskCounts?.Medium || stats.riskCounts?.High) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Low', value: stats.riskCounts?.Low || 0 },
                { name: 'Medium', value: stats.riskCounts?.Medium || 0 },
                { name: 'High', value: stats.riskCounts?.High || 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Receipts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Receipts</h2>
              <Link 
                to="/upload" 
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Upload New
              </Link>
            </div>
          </div>
          {recentReceipts.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-sm font-medium text-gray-900 mb-2">No receipts yet</h3>
              <p className="text-sm text-gray-500 mb-4">Get started by uploading your first receipt.</p>
              <Link
                to="/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Upload Receipt
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentReceipts.map((receipt) => (
                    <tr key={receipt._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(receipt.date, 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{receipt.vendor || 'Unknown Vendor'}</div>
                        {receipt.invoice_number && (
                          <div className="text-sm text-gray-500">#{receipt.invoice_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(receipt.total || 0, receipt.currency || user?.currency || 'USD')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          riskColors[receipt.aiAnalysis?.risk_level] || riskColors.Low
                        }`}>
                          {receipt.aiAnalysis?.risk_level || 'Low'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                          statusColors[receipt.status] || statusColors.pending
                        }`}>
                          {receipt.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

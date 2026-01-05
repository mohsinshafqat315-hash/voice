// Expense table component - displays categorized expenses
// Supports grouping, filtering, and bulk operations

import { useState, useMemo } from 'react';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';

const ExpenseTable = ({
  receipts = [],
  groupBy = 'category', // 'category', 'vendor', 'month', 'none'
  showSummary = true,
  className = ''
}) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'total', direction: 'desc' });

  // Group expenses
  const groupedExpenses = useMemo(() => {
    if (groupBy === 'none' || !groupBy) {
      return { 'All Expenses': receipts };
    }

    const groups = {};

    receipts.forEach(receipt => {
      let groupKey = 'Uncategorized';

      if (groupBy === 'category') {
        groupKey = receipt.category || 'Uncategorized';
      } else if (groupBy === 'vendor') {
        groupKey = receipt.vendor || 'Unknown Vendor';
      } else if (groupBy === 'month') {
        const date = new Date(receipt.date);
        groupKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(receipt);
    });

    // Calculate totals for each group
    Object.keys(groups).forEach(key => {
      groups[key].total = groups[key].reduce((sum, r) => sum + (r.total || 0), 0);
      groups[key].count = groups[key].length;
      groups[key].tax = groups[key].reduce((sum, r) => sum + (r.tax || 0), 0);
    });

    return groups;
  }, [receipts, groupBy]);

  // Sort groups
  const sortedGroups = useMemo(() => {
    return Object.entries(groupedExpenses).sort(([aKey, aData], [bKey, bData]) => {
      const aValue = aData.total || 0;
      const bValue = bData.total || 0;
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [groupedExpenses, sortConfig]);

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Calculate overall summary
  const summary = useMemo(() => {
    const total = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
    const tax = receipts.reduce((sum, r) => sum + (r.tax || 0), 0);
    const count = receipts.length;

    // Group by category for summary
    const categoryBreakdown = {};
    receipts.forEach(r => {
      const cat = r.category || 'Uncategorized';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { total: 0, count: 0 };
      }
      categoryBreakdown[cat].total += r.total || 0;
      categoryBreakdown[cat].count += 1;
    });

    return { total, tax, count, categoryBreakdown };
  }, [receipts]);

  if (receipts.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-8 text-center ${className}`}>
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No expenses found</h3>
        <p className="mt-2 text-sm text-gray-500">Expenses will appear here once receipts are uploaded.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Section */}
      {showSummary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.total, 'USD')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tax</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.tax, 'USD')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Receipts</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(summary.count)}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">By Category</h4>
            <div className="space-y-2">
              {Object.entries(summary.categoryBreakdown)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{category}</span>
                      <span className="text-xs text-gray-500">({data.count})</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(data.total, 'USD')}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Grouped Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Expenses {groupBy !== 'none' && `by ${groupBy}`}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSort('total')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
            >
              <span>Sort by Total</span>
              {sortConfig.key === 'total' && (
                <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? '' : 'transform rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {groupBy === 'none' ? 'Date' : 'Group'}
                </th>
                {groupBy !== 'none' && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {groupBy === 'vendor' ? 'Invoice' : 'Vendor'}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedGroups.map(([groupKey, groupData]) => {
                const isExpanded = expandedGroups.has(groupKey);
                const expenses = Array.isArray(groupData) ? groupData : groupData.filter ? groupData.filter(r => typeof r === 'object' && r.date) : [];
                const groupTotal = groupData.total || 0;
                const groupCount = groupData.count || expenses.length;

                return (
                  <tbody key={groupKey} className="divide-y divide-gray-200">
                    {/* Group Header Row */}
                    {groupBy !== 'none' && (
                      <tr
                        className="bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        onClick={() => toggleGroup(groupKey)}
                      >
                        <td colSpan={groupBy === 'vendor' ? 7 : 6} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <svg
                                className={`w-5 h-5 text-gray-500 transform transition-transform ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="text-sm font-semibold text-gray-900">{groupKey}</span>
                              <span className="text-xs text-gray-500">({groupCount} items)</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatCurrency(groupTotal, 'USD')}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Group Items */}
                    {(groupBy === 'none' || isExpanded) && expenses.map((receipt) => (
                      <tr key={receipt._id || receipt.id} className="hover:bg-gray-50">
                        {groupBy === 'none' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(receipt.date, 'MMM dd, yyyy')}
                          </td>
                        )}
                        {groupBy !== 'none' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(receipt.date, 'MMM dd, yyyy')}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {groupBy === 'vendor' ? receipt.invoice_number || 'N/A' : receipt.vendor || 'Unknown Vendor'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {receipt.category || 'Uncategorized'}
                          </div>
                          {receipt.notes && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {receipt.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency((receipt.total || 0) - (receipt.tax || 0), receipt.currency || 'USD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(receipt.tax || 0, receipt.currency || 'USD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                          {formatCurrency(receipt.total || 0, receipt.currency || 'USD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTable;

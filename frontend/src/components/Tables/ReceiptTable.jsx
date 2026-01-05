// Receipt table component - displays list of receipts with sorting and filtering
// Includes actions: view, edit, delete, export

import { useState, useMemo } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ReceiptModal from '../Modals/ReceiptModal';
import ConfirmModal from '../Modals/ConfirmModal';
import PrimaryButton from '../Buttons/PrimaryButton';
import SecondaryButton from '../Buttons/SecondaryButton';

const ReceiptTable = ({
  receipts = [],
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onView,
  loading = false,
  className = ''
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedRows, setSelectedRows] = useState(new Set());

  const riskColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    flagged: 'bg-orange-100 text-orange-800'
  };

  // Sort receipts
  const sortedReceipts = useMemo(() => {
    if (!sortConfig.key) return receipts;

    return [...receipts].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle nested properties
      if (sortConfig.key === 'risk_level') {
        aValue = a.aiAnalysis?.risk_level || 'Low';
        bValue = b.aiAnalysis?.risk_level || 'Low';
      }

      // Handle dates
      if (sortConfig.key === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [receipts, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowClick = (receipt) => {
    if (onView) {
      onView(receipt);
    } else {
      setSelectedReceipt(receipt);
      setIsModalOpen(true);
    }
  };

  const handleEdit = (e, receipt) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(receipt);
    } else {
      setSelectedReceipt(receipt);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (e, receipt) => {
    e.stopPropagation();
    setSelectedReceipt(receipt);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedReceipt && onDelete) {
      onDelete(selectedReceipt._id || selectedReceipt.id);
    }
    setIsDeleteModalOpen(false);
    setSelectedReceipt(null);
  };

  const handleApprove = (e, receipt) => {
    e.stopPropagation();
    if (onApprove) {
      onApprove(receipt._id || receipt.id);
    }
  };

  const handleReject = (e, receipt) => {
    e.stopPropagation();
    if (onReject) {
      onReject(receipt._id || receipt.id);
    }
  };

  const handleSelectRow = (e, receiptId) => {
    e.stopPropagation();
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(receiptId)) {
        newSet.delete(receiptId);
      } else {
        newSet.add(receiptId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(receipts.map(r => r._id || r.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading receipts...</p>
        </div>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-8 text-center ${className}`}>
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No receipts found</h3>
        <p className="mt-2 text-sm text-gray-500">Get started by uploading your first receipt.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
        {selectedRows.size > 0 && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedRows.size} receipt{selectedRows.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <SecondaryButton onClick={() => setSelectedRows(new Set())}>
                Clear Selection
              </SecondaryButton>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === receipts.length && receipts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <SortIcon columnKey="date" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('vendor')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Vendor</span>
                    <SortIcon columnKey="vendor" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Amount</span>
                    <SortIcon columnKey="total" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('risk_level')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Risk</span>
                    <SortIcon columnKey="risk_level" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <SortIcon columnKey="status" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedReceipts.map((receipt) => {
                const receiptId = receipt._id || receipt.id;
                const isSelected = selectedRows.has(receiptId);

                return (
                  <tr
                    key={receiptId}
                    onClick={() => handleRowClick(receipt)}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(e, receiptId)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(receipt.date, 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {receipt.vendor || 'Unknown Vendor'}
                      </div>
                      {receipt.invoice_number && (
                        <div className="text-sm text-gray-500">
                          #{receipt.invoice_number}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(receipt.total || 0, receipt.currency || 'USD')}
                      </div>
                      {receipt.tax > 0 && (
                        <div className="text-xs text-gray-500">
                          Tax: {formatCurrency(receipt.tax, receipt.currency || 'USD')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {receipt.aiAnalysis?.risk_level && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          riskColors[receipt.aiAnalysis.risk_level] || riskColors.Low
                        }`}>
                          {receipt.aiAnalysis.risk_level}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        statusColors[receipt.status] || statusColors.pending
                      }`}>
                        {receipt.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        {receipt.status === 'pending' && onApprove && (
                          <button
                            onClick={(e) => handleApprove(e, receipt)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        {receipt.status === 'pending' && onReject && (
                          <button
                            onClick={(e) => handleReject(e, receipt)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={(e) => handleEdit(e, receipt)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => handleDelete(e, receipt)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReceipt(null);
          }}
          receipt={selectedReceipt}
          onEdit={onEdit}
          onDelete={() => {
            setIsModalOpen(false);
            setIsDeleteModalOpen(true);
          }}
          onApprove={onApprove ? () => onApprove(selectedReceipt._id || selectedReceipt.id) : undefined}
          onReject={onReject ? () => onReject(selectedReceipt._id || selectedReceipt.id) : undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedReceipt(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Receipt"
        message="Are you sure you want to delete this receipt? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default ReceiptTable;

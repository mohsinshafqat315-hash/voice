// Receipt card component - displays receipt information
// Shows receipt details in card format

import { formatCurrency, formatDate } from '../../utils/formatters';

const ReceiptCard = ({ receipt, onClick, className = '' }) => {
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

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-md p-4
        hover:shadow-lg transition-shadow duration-200
        cursor-pointer
        ${className}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {receipt.vendor || 'Unknown Vendor'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(receipt.date)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(receipt.total || 0, receipt.currency || 'USD')}
          </p>
          {receipt.tax > 0 && (
            <p className="text-xs text-gray-500">
              Tax: {formatCurrency(receipt.tax, receipt.currency || 'USD')}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          {receipt.aiAnalysis?.risk_level && (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              riskColors[receipt.aiAnalysis.risk_level] || riskColors.Low
            }`}>
              {receipt.aiAnalysis.risk_level} Risk
            </span>
          )}
          <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
            statusColors[receipt.status] || statusColors.pending
          }`}>
            {receipt.status || 'pending'}
          </span>
        </div>
        {receipt.invoice_number && (
          <p className="text-xs text-gray-500">
            #{receipt.invoice_number}
          </p>
        )}
      </div>

      {receipt.aiAnalysis?.alerts && receipt.aiAnalysis.alerts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-yellow-700 font-medium">
            ⚠️ {receipt.aiAnalysis.alerts.length} alert(s)
          </p>
        </div>
      )}
    </div>
  );
};

export default ReceiptCard;

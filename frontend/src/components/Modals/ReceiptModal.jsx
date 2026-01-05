// Receipt modal component - displays receipt details
// Shows full receipt information in a modal

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import PrimaryButton from '../Buttons/PrimaryButton';
import SecondaryButton from '../Buttons/SecondaryButton';

const ReceiptModal = ({
  isOpen,
  onClose,
  receipt,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  loading = false
}) => {
  if (!receipt) return null;

  const riskColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800'
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="p-6">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold leading-6 text-gray-900 mb-4"
                  >
                    Receipt Details
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Vendor</p>
                        <p className="text-base text-gray-900">{receipt.vendor || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date</p>
                        <p className="text-base text-gray-900">{formatDate(receipt.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Amount</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(receipt.total || 0, receipt.currency || 'USD')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tax</p>
                        <p className="text-base text-gray-900">
                          {formatCurrency(receipt.tax || 0, receipt.currency || 'USD')}
                        </p>
                      </div>
                      {receipt.invoice_number && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Invoice Number</p>
                          <p className="text-base text-gray-900">{receipt.invoice_number}</p>
                        </div>
                      )}
                      {receipt.VAT_ID && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">VAT ID</p>
                          <p className="text-base text-gray-900">{receipt.VAT_ID}</p>
                        </div>
                      )}
                    </div>

                    {/* Risk Analysis */}
                    {receipt.aiAnalysis && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Risk Analysis</p>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            riskColors[receipt.aiAnalysis.risk_level] || riskColors.Low
                          }`}>
                            {receipt.aiAnalysis.risk_level} Risk ({receipt.aiAnalysis.risk_score}/100)
                          </span>
                          <span className="text-sm text-gray-600">
                            Confidence: {(receipt.aiAnalysis.confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        {receipt.aiAnalysis.alerts && receipt.aiAnalysis.alerts.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-yellow-700 mb-1">Alerts:</p>
                            <ul className="list-disc list-inside text-sm text-yellow-700">
                              {receipt.aiAnalysis.alerts.map((alert, i) => (
                                <li key={i}>{alert}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {receipt.notes && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                        <p className="text-sm text-gray-900">{receipt.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                    {receipt.status === 'pending' && onApprove && (
                      <PrimaryButton onClick={onApprove} loading={loading}>
                        Approve
                      </PrimaryButton>
                    )}
                    {receipt.status === 'pending' && onReject && (
                      <SecondaryButton variant="danger" onClick={onReject} loading={loading}>
                        Reject
                      </SecondaryButton>
                    )}
                    {onEdit && (
                      <SecondaryButton onClick={onEdit} disabled={loading}>
                        Edit
                      </SecondaryButton>
                    )}
                    {onDelete && (
                      <SecondaryButton variant="danger" onClick={onDelete} disabled={loading}>
                        Delete
                      </SecondaryButton>
                    )}
                    <SecondaryButton onClick={onClose} disabled={loading}>
                      Close
                    </SecondaryButton>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReceiptModal;

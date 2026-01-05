// Receipt form component - edit receipt details
// Allows manual editing of receipt information

import { useState, useEffect } from 'react';
import PrimaryButton from '../Buttons/PrimaryButton';
import SecondaryButton from '../Buttons/SecondaryButton';

const ReceiptForm = ({ receipt, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    vendor: receipt?.vendor || '',
    date: receipt?.date ? new Date(receipt.date).toISOString().split('T')[0] : '',
    total: receipt?.total || 0,
    tax: receipt?.tax || 0,
    currency: receipt?.currency || 'USD',
    VAT_ID: receipt?.VAT_ID || '',
    invoice_number: receipt?.invoice_number || '',
    category: receipt?.category || '',
    notes: receipt?.notes || ''
  });

  useEffect(() => {
    if (receipt) {
      setFormData({
        vendor: receipt.vendor || '',
        date: receipt.date ? new Date(receipt.date).toISOString().split('T')[0] : '',
        total: receipt.total || 0,
        tax: receipt.tax || 0,
        currency: receipt.currency || 'USD',
        VAT_ID: receipt.VAT_ID || '',
        invoice_number: receipt.invoice_number || '',
        category: receipt.category || '',
        notes: receipt.notes || ''
      });
    }
  }, [receipt]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total' || name === 'tax' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vendor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vendor *
          </label>
          <input
            type="text"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Total */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount *
          </label>
          <input
            type="number"
            name="total"
            value={formData.total}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tax */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tax
          </label>
          <input
            type="number"
            name="tax"
            value={formData.tax}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="PKR">PKR</option>
          </select>
        </div>

        {/* Invoice Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Number
          </label>
          <input
            type="text"
            name="invoice_number"
            value={formData.invoice_number}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* VAT ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            VAT ID
          </label>
          <input
            type="text"
            name="VAT_ID"
            value={formData.VAT_ID}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit" loading={loading}>
          Save Changes
        </PrimaryButton>
      </div>
    </form>
  );
};

export default ReceiptForm;

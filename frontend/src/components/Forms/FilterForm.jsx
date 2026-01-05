// Filter form component - advanced filtering for receipts
// Allows filtering by date, risk level, status, vendor, etc.

import { useState } from 'react';
import PrimaryButton from '../Buttons/PrimaryButton';
import SecondaryButton from '../Buttons/SecondaryButton';

const FilterForm = ({ onFilter, onReset, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    dateFrom: initialFilters.dateFrom || '',
    dateTo: initialFilters.dateTo || '',
    riskLevel: initialFilters.riskLevel || '',
    status: initialFilters.status || '',
    vendor: initialFilters.vendor || '',
    minAmount: initialFilters.minAmount || '',
    maxAmount: initialFilters.maxAmount || '',
    ...initialFilters
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Remove empty filters
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );
    onFilter(activeFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      dateFrom: '',
      dateTo: '',
      riskLevel: '',
      status: '',
      vendor: '',
      minAmount: '',
      maxAmount: ''
    };
    setFilters(emptyFilters);
    onReset();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Receipts</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date From
          </label>
          <input
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date To
          </label>
          <input
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Risk Level
          </label>
          <select
            name="riskLevel"
            value={filters.riskLevel}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        {/* Vendor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vendor
          </label>
          <input
            type="text"
            name="vendor"
            value={filters.vendor}
            onChange={handleChange}
            placeholder="Search vendor..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Min Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Amount
          </label>
          <input
            type="number"
            name="minAmount"
            value={filters.minAmount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Max Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Amount
          </label>
          <input
            type="number"
            name="maxAmount"
            value={filters.maxAmount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <SecondaryButton type="button" onClick={handleReset}>
          Reset
        </SecondaryButton>
        <PrimaryButton type="submit">
          Apply Filters
        </PrimaryButton>
      </div>
    </form>
  );
};

export default FilterForm;

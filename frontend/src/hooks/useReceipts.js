// Custom hook for receipt operations
// Provides receipt state and methods: fetch, create, update, delete

import { useState, useEffect, useCallback } from 'react';
import receiptsService from '../services/receipts';
import notifications from '../services/notifications';

export const useReceipts = (initialFilters = {}) => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState(initialFilters);

  /**
   * Fetch receipts
   */
  const fetchReceipts = useCallback(async (newFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedFilters = { ...filters, ...newFilters };
      const response = await receiptsService.getReceipts(mergedFilters);
      
      setReceipts(response.receipts || []);
      setPagination({
        page: response.page || 1,
        limit: response.count || 20,
        total: response.total || 0,
        totalPages: response.totalPages || 0
      });
      setFilters(mergedFilters);
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to load receipts';
      setError(errorMessage);
      notifications.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Upload receipt
   */
  const uploadReceipt = useCallback(async (file, onProgress) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await receiptsService.uploadReceipt(file, onProgress);
      notifications.success('Receipt uploaded successfully');
      
      // Refresh receipts list
      await fetchReceipts();
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to upload receipt';
      setError(errorMessage);
      notifications.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchReceipts]);

  /**
   * Update receipt
   */
  const updateReceipt = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await receiptsService.updateReceipt(id, data);
      notifications.success('Receipt updated successfully');
      
      // Update local state
      setReceipts(prev => prev.map(r => r._id === id ? response.receipt : r));
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update receipt';
      setError(errorMessage);
      notifications.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete receipt
   */
  const deleteReceipt = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await receiptsService.deleteReceipt(id);
      notifications.success('Receipt deleted successfully');
      
      // Remove from local state
      setReceipts(prev => prev.filter(r => r._id !== id));
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete receipt';
      setError(errorMessage);
      notifications.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Approve receipt
   */
  const approveReceipt = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await receiptsService.approveReceipt(id);
      notifications.success('Receipt approved');
      
      // Update local state
      setReceipts(prev => prev.map(r => r._id === id ? response.receipt : r));
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to approve receipt';
      notifications.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reject receipt
   */
  const rejectReceipt = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await receiptsService.rejectReceipt(id);
      notifications.success('Receipt rejected');
      
      // Update local state
      setReceipts(prev => prev.map(r => r._id === id ? response.receipt : r));
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to reject receipt';
      notifications.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchReceipts();
  }, []);

  return {
    receipts,
    loading,
    error,
    pagination,
    filters,
    fetchReceipts,
    uploadReceipt,
    updateReceipt,
    deleteReceipt,
    approveReceipt,
    rejectReceipt,
    setFilters
  };
};

export default useReceipts;

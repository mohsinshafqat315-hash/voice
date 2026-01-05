// Receipts service - API calls for receipt operations
// CRUD operations: create, read, update, delete receipts

import api from './api';

export const receiptsService = {
  /**
   * Get all receipts with optional filters
   */
  async getReceipts(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.riskLevel) params.append('riskLevel', filters.riskLevel);
    if (filters.status) params.append('status', filters.status);
    if (filters.requiresReview !== undefined) params.append('requiresReview', filters.requiresReview);
    
    const response = await api.get(`/receipts?${params.toString()}`);
    return response.data;
  },

  /**
   * Get single receipt by ID
   */
  async getReceipt(id) {
    const response = await api.get(`/receipts/${id}`);
    return response.data;
  },

  /**
   * Upload receipt file
   */
  async uploadReceipt(file, onUploadProgress) {
    const formData = new FormData();
    formData.append('receipt', file);
    
    const response = await api.post('/receipts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
      timeout: 60000 // 60 seconds for upload + processing
    });
    
    return response.data;
  },

  /**
   * Update receipt
   */
  async updateReceipt(id, data) {
    const response = await api.put(`/receipts/${id}`, data);
    return response.data;
  },

  /**
   * Delete receipt
   */
  async deleteReceipt(id) {
    const response = await api.delete(`/receipts/${id}`);
    return response.data;
  },

  /**
   * Get receipts requiring review
   */
  async getReceiptsForReview() {
    const response = await api.get('/receipts/review');
    return response.data;
  },

  /**
   * Approve receipt
   */
  async approveReceipt(id) {
    const response = await api.post(`/receipts/${id}/approve`);
    return response.data;
  },

  /**
   * Reject receipt
   */
  async rejectReceipt(id) {
    const response = await api.post(`/receipts/${id}/reject`);
    return response.data;
  }
};

export default receiptsService;

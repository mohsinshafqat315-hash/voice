// Reports service - API calls for report generation
// Fetch reports, export data, generate summaries

import api from './api';

export const reportsService = {
  /**
   * Get report summary/statistics
   */
  async getSummary(filters = {}) {
    const params = new URLSearchParams();
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    
    const response = await api.get(`/reports/summary?${params.toString()}`);
    return response.data;
  },

  /**
   * Export report
   */
  async exportReport(format = 'csv', filters = {}) {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.riskLevel) params.append('riskLevel', filters.riskLevel);
    if (filters.status) params.append('status', filters.status);
    
    const response = await api.get(`/reports/export?${params.toString()}`, {
      responseType: format === 'pdf' ? 'blob' : 'blob'
    });
    
    // Create download link
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const extension = format === 'pdf' ? 'pdf' : format === 'excel' || format === 'xlsx' ? 'xlsx' : 'csv';
    link.download = `receipts-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },

  /**
   * Export audit report
   */
  async exportAuditReport(format = 'pdf', filters = {}) {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    
    const response = await api.get(`/reports/audit?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-report-${Date.now()}.${format === 'pdf' ? 'pdf' : 'csv'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return response.data;
  }
};

export default reportsService;

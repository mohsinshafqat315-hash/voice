// Receipt context - global receipt state management
// Manages receipt data, filters, and shared state across components

import { createContext, useContext, useState } from 'react';

const ReceiptContext = createContext();

export const ReceiptProvider = ({ children }) => {
  const [receipts, setReceipts] = useState([]);
  const [filters, setFilters] = useState({});

  const value = {
    receipts,
    setReceipts,
    filters,
    setFilters
  };

  return <ReceiptContext.Provider value={value}>{children}</ReceiptContext.Provider>;
};

export const useReceipts = () => {
  const context = useContext(ReceiptContext);
  if (!context) {
    throw new Error('useReceipts must be used within ReceiptProvider');
  }
  return context;
};

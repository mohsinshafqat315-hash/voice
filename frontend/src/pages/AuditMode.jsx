// Audit Mode page - comprehensive audit view with risk scoring
// Displays flagged receipts, compliance issues, and audit trail

import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuditMode = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditReceipts();
  }, []);

  const loadAuditReceipts = async () => {
    try {
      const response = await api.get('/receipts?riskLevel=High');
      setReceipts(response.data.receipts);
    } catch (error) {
      toast.error('Failed to load audit receipts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Audit Mode</h1>
      <div className="space-y-4">
        {receipts.map((receipt) => (
          <div key={receipt._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{receipt.vendor}</h3>
                <p className="text-gray-600">Risk Score: {receipt.aiAnalysis?.risk_score}</p>
                {receipt.aiAnalysis?.alerts?.map((alert, i) => (
                  <p key={i} className="text-red-700 text-sm mt-2">⚠ {alert}</p>
                ))}
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                High Risk
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditMode;

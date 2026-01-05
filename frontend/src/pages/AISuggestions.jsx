// AI Suggestions page - displays AI-powered recommendations for receipts
// Shows tax compliance suggestions, categorization, and risk alerts

import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AISuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await api.get('/receipts?requiresReview=true');
      setSuggestions(response.data.receipts);
    } catch (error) {
      toast.error('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">AI Suggestions</h1>
      <div className="space-y-4">
        {suggestions.map((receipt) => (
          <div key={receipt._id} className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg">{receipt.vendor}</h3>
            <p className="text-gray-600">Risk: {receipt.aiAnalysis?.risk_level}</p>
            {receipt.aiAnalysis?.alerts?.map((alert, i) => (
              <p key={i} className="text-yellow-700 text-sm mt-2">⚠ {alert}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISuggestions;

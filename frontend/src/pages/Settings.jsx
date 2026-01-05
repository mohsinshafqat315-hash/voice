// Settings page - display and manage subscription, preferences
// Link to Stripe Checkout, country & currency selection, notification prefs

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [settingsRes, plansRes] = await Promise.all([
        api.get('/settings'),
        api.get('/payments/plans')
      ]);
      setSettings(settingsRes.data.settings);
      setPlans(plansRes.data.plans);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      const response = await api.post('/payments/create-checkout', { plan });
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to create checkout session');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Subscription Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Subscription</h2>
        <div className="mb-4">
          <p className="text-gray-600">Current Plan: <span className="font-semibold capitalize">{settings?.subscription?.plan || 'Free'}</span></p>
          <p className="text-gray-600">Status: <span className="font-semibold capitalize">{settings?.subscription?.status || 'Active'}</span></p>
        </div>
        {plans && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(plans).map(([key, plan]) => (
              <div key={key} className="border rounded-lg p-4">
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold my-2">${plan.price}/mo</p>
                <ul className="text-sm text-gray-600 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i}>• {feature}</li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={settings?.subscription?.plan === key}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {settings?.subscription?.plan === key ? 'Current Plan' : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <select className="mt-1 block w-full border-gray-300 rounded-md">
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="DE">Germany</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select className="mt-1 block w-full border-gray-300 rounded-md">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="PKR">PKR</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;


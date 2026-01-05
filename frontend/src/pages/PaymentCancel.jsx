// Payment cancel page - shown when user cancels Stripe checkout
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">You cancelled the payment process.</p>
        <button
          onClick={() => navigate('/settings')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Back to Settings
        </button>
      </div>
    </div>
  );
};

export default PaymentCancel;


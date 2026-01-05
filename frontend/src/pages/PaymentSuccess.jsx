// Payment success page - shown after successful Stripe checkout
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    toast.success('Payment successful! Your subscription is now active.');
    setTimeout(() => {
      navigate('/settings');
    }, 3000);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-gray-600">Redirecting to settings...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;


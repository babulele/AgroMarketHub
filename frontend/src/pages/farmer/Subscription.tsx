import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Subscription {
  _id: string;
  plan: 'monthly' | 'annual';
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  amount: number;
}

const Subscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscription(response.data.data.subscription);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load subscription');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    setProcessing(true);
    try {
      // In a real app, you'd initiate M-Pesa payment first
      // For now, we'll simulate with a transaction ID
      const mpesaTransactionId = `MPESA${Date.now()}`;
      
      await api.post('/subscriptions', {
        plan,
        mpesaTransactionId,
      });
      
      toast.success('Subscription activated successfully!');
      fetchSubscription();
    } catch (error: any) {
      toast.error('Failed to create subscription');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      await api.put('/subscriptions/cancel');
      toast.success('Subscription cancelled');
      fetchSubscription();
    } catch (error: any) {
      toast.error('Failed to cancel subscription');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading subscription...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Subscription</h1>

      {subscription ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Current Subscription</h2>
              <p className="text-sm text-gray-600 mt-1">
                {subscription.plan === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                subscription.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : subscription.status === 'expired'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {subscription.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-semibold">{formatDate(subscription.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">End Date:</span>
              <span className="font-semibold">{formatDate(subscription.endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-semibold">KES {subscription.amount.toLocaleString()}</span>
            </div>
          </div>

          {subscription.status === 'active' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">No Active Subscription</h2>
          <p className="text-gray-600 mb-6">
            Subscribe to access advanced features like AI demand forecasting, analytics, and priority support.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Monthly Plan</h3>
              <p className="text-3xl font-bold text-primary-600 mb-4">KES 500</p>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li>✓ AI demand forecasts</li>
                <li>✓ Sales analytics</li>
                <li>✓ Email alerts</li>
                <li>✓ Priority support</li>
              </ul>
              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={processing}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Subscribe Monthly
              </button>
            </div>

            <div className="border-2 border-primary-600 rounded-lg p-6 relative">
              <span className="absolute top-4 right-4 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                BEST VALUE
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Annual Plan</h3>
              <p className="text-3xl font-bold text-primary-600 mb-4">KES 5,000</p>
              <p className="text-sm text-gray-600 mb-4">Save KES 1,000 per year</p>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li>✓ All monthly features</li>
                <li>✓ Custom reports</li>
                <li>✓ Advanced analytics</li>
                <li>✓ 2 months free</li>
              </ul>
              <button
                onClick={() => handleSubscribe('annual')}
                disabled={processing}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Subscribe Annually
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;

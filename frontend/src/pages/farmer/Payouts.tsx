import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Payout } from '../../types';
import { useAuthStore } from '../../store/authStore';

const statusStyles: Record<Payout['status'], string> = {
  requested: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const Payouts = () => {
  const { user } = useAuthStore();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    phoneNumber: user?.phone || '',
    remarks: '',
  });

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mpesa/payouts');
      setPayouts(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.amount) {
      toast.error('Please enter an amount');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/mpesa/payouts', {
        amount: Number(form.amount),
        phoneNumber: form.phoneNumber,
        remarks: form.remarks,
      });
      toast.success('Payout request submitted');
      setForm((prev) => ({ ...prev, amount: '', remarks: '' }));
      fetchPayouts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit payout request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">M-Pesa Payouts</h1>
        <p className="text-sm text-gray-600">
          Withdraw your available earnings directly to your M-Pesa wallet.
        </p>

        <form className="mt-6 grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount (KES)</label>
            <input
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter amount e.g. 5000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">M-Pesa Phone Number</label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="254712345678"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Remarks (optional)</label>
            <input
              type="text"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="e.g. Weekly withdrawal"
              maxLength={200}
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Request Payout'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Payout History</h2>
          <button
            onClick={fetchPayouts}
            className="text-sm text-primary-600 hover:text-primary-700"
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading payouts...</div>
        ) : payouts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No payout requests yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payouts.map((payout) => (
                  <tr key={payout._id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payout.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                      KES {payout.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {payout.phoneNumber}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[payout.status]}`}
                      >
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {payout.mpesaTransactionId || '—'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {payout.status === 'failed'
                        ? payout.failureReason || payout.mpesaResponseDescription || 'Failed'
                        : payout.remarks || payout.mpesaResponseDescription || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payouts;


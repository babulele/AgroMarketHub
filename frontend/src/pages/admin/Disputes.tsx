import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Dispute {
  _id: string;
  order: {
    _id: string;
    totalAmount: number;
  };
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  type: string;
  status: string;
  description: string;
  evidence?: string[];
  createdAt: string;
}

const Disputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState({
    action: 'refund',
    refundAmount: 0,
    notes: '',
  });

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const response = await api.get('/admin/disputes');
      setDisputes(response.data.data.disputes || []);
    } catch (error: any) {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId: string) => {
    try {
      await api.put(`/admin/disputes/${disputeId}/resolve`, resolution);
      toast.success('Dispute resolved successfully');
      setSelectedDispute(null);
      fetchDisputes();
    } catch (error: any) {
      toast.error('Failed to resolve dispute');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-red-100 text-red-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading disputes...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dispute Resolution</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Disputes List */}
        <div className="lg:col-span-2 space-y-4">
          {disputes.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">No disputes</p>
            </div>
          ) : (
            disputes.map((dispute) => (
              <div
                key={dispute._id}
                className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
                onClick={() => setSelectedDispute(dispute)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{dispute.order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {dispute.buyer.firstName} {dispute.buyer.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{dispute.buyer.email}</p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      dispute.status
                    )}`}
                  >
                    {dispute.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-sm font-semibold text-gray-700">Type: </span>
                  <span className="text-sm text-gray-600 capitalize">
                    {dispute.type.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-sm text-gray-700">{dispute.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(dispute.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Resolution Panel */}
        {selectedDispute && selectedDispute.status !== 'resolved' && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Resolve Dispute</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={resolution.action}
                    onChange={(e) =>
                      setResolution({ ...resolution, action: e.target.value })
                    }
                  >
                    <option value="refund">Full Refund</option>
                    <option value="partial_refund">Partial Refund</option>
                    <option value="replacement">Replacement</option>
                    <option value="rejected">Reject Dispute</option>
                  </select>
                </div>

                {(resolution.action === 'refund' || resolution.action === 'partial_refund') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refund Amount (KES)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={resolution.refundAmount}
                      onChange={(e) =>
                        setResolution({
                          ...resolution,
                          refundAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      max={selectedDispute.order.totalAmount}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={resolution.notes}
                    onChange={(e) =>
                      setResolution({ ...resolution, notes: e.target.value })
                    }
                    placeholder="Resolution notes..."
                  />
                </div>

                <button
                  onClick={() => handleResolve(selectedDispute._id)}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Resolve Dispute
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Disputes;

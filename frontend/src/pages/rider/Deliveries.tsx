import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Delivery {
  _id: string;
  order: {
    _id: string;
    totalAmount: number;
    items: any[];
  };
  status: string;
  deliveryLocation: {
    address: string;
    county: string;
    subCounty: string;
  };
  pickupLocation: {
    address: string;
    county: string;
    subCounty: string;
  };
  estimatedDeliveryTime?: string;
}

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/deliveries');
      setDeliveries(response.data.data.deliveries || []);
    } catch (error: any) {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (deliveryId: string, status: string) => {
    try {
      await api.put(`/deliveries/${deliveryId}/status`, { status });
      toast.success('Status updated successfully');
      fetchDeliveries();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      assigned: 'bg-blue-100 text-blue-800',
      picking: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      assigned: 'picking',
      picking: 'in_transit',
      in_transit: 'delivered',
    };
    return statusFlow[currentStatus];
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading deliveries...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Deliveries</h1>

      {deliveries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No deliveries assigned yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{delivery.order._id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Amount: KES {delivery.order.totalAmount.toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                    delivery.status
                  )}`}
                >
                  {delivery.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Pickup Location</h4>
                  <p className="text-sm text-gray-600">{delivery.pickupLocation.address}</p>
                  <p className="text-sm text-gray-600">
                    {delivery.pickupLocation.county}, {delivery.pickupLocation.subCounty}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Delivery Location</h4>
                  <p className="text-sm text-gray-600">{delivery.deliveryLocation.address}</p>
                  <p className="text-sm text-gray-600">
                    {delivery.deliveryLocation.county}, {delivery.deliveryLocation.subCounty}
                  </p>
                </div>
              </div>

              {getNextStatus(delivery.status) && (
                <button
                  onClick={() => updateStatus(delivery._id, getNextStatus(delivery.status)!)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Mark as {getNextStatus(delivery.status)?.replace('_', ' ').toUpperCase()}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Deliveries;

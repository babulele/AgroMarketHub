import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Order } from '../../types';
import toast from 'react-hot-toast';

const Sales = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await api.get('/orders');
      const ordersData = response.data.data.orders;
      setOrders(ordersData);

      // Calculate stats
      const totalSales = ordersData.reduce(
        (sum: number, order: Order) => sum + order.totalAmount,
        0
      );
      const totalOrders = ordersData.length;
      const pendingOrders = ordersData.filter(
        (o: Order) => o.status === 'pending' || o.status === 'confirmed'
      ).length;
      const completedOrders = ordersData.filter(
        (o: Order) => o.status === 'delivered'
      ).length;

      setStats({
        totalSales,
        totalOrders,
        pendingOrders,
        completedOrders,
      });
    } catch (error: any) {
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading sales data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Sales Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Sales</h3>
          <p className="text-2xl font-bold text-gray-900">
            KES {stats.totalSales.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Orders</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Completed</h3>
          <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="divide-y">
          {orders.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No orders yet</div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {item.name} - {item.quantity} {item.unit}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <p className="mt-2 text-lg font-bold text-gray-900">
                      KES {order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sales;

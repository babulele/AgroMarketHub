import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Order } from '../../types';
import toast from 'react-hot-toast';
import ReviewForm from '../../components/ReviewForm';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingOrder, setReviewingOrder] = useState<{ orderId: string; productId: string } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data.orders);
    } catch (error: any) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      assigned: 'bg-indigo-100 text-indigo-800',
      picking: 'bg-pink-100 text-pink-800',
      in_transit: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <Link
            to="/buyer"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Placed on {formatDate(order.createdAt)}
                  </p>
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

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Items:</h4>
                <ul className="space-y-1">
                  {order.items.map((item, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {item.name} - {item.quantity} {item.unit} @ KES {item.price}
                    </li>
                  ))}
                </ul>
              </div>

              {order.delivery && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-1">Delivery:</h4>
                  <p className="text-sm text-gray-600">{order.delivery.address}</p>
                  <p className="text-sm text-gray-600">
                    {order.delivery.county}, {order.delivery.subCounty}
                  </p>
                </div>
              )}

              {order.payment && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-1">Payment:</h4>
                  <p className="text-sm text-gray-600">
                    Status: <span className="capitalize">{order.payment.status}</span>
                  </p>
                  {order.payment.mpesaTransactionId && (
                    <p className="text-sm text-gray-600">
                      Transaction ID: {order.payment.mpesaTransactionId}
                    </p>
                  )}
                </div>
              )}

              {/* Review Button for Delivered Orders */}
              {order.status === 'delivered' && order.items.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-2">Review Your Purchase</h4>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => {
                      // Order items may have product as ObjectId or productId
                      const productId = (item as any).productId || (item as any).product?._id || (item as any).product;
                      if (!productId) return null;
                      return (
                        <button
                          key={idx}
                          onClick={() => setReviewingOrder({ orderId: order._id, productId: productId.toString() })}
                          className="w-full text-left px-4 py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 text-sm"
                        >
                          Leave a review for {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Form Modal */}
      {reviewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <ReviewForm
                productId={reviewingOrder.productId}
                orderId={reviewingOrder.orderId}
                onSuccess={() => {
                  setReviewingOrder(null);
                  fetchOrders(); // Refresh orders to update review status
                }}
                onCancel={() => setReviewingOrder(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState({
    address: '',
    county: '',
    subCounty: '',
    phone: user?.phone || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('mpesa');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!delivery.address || !delivery.county || !delivery.phone) {
      toast.error('Please fill in all delivery details');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        delivery,
      };

      const orderResponse = await api.post('/orders', orderData);
      const order = orderResponse.data.data.order;

      // Initiate M-Pesa payment
      if (paymentMethod === 'mpesa') {
        try {
          const paymentResponse = await api.post('/mpesa/payment', {
            phoneNumber: delivery.phone,
            amount: getTotal(),
            orderId: order._id,
          });

          // Check if it's a mock response
          if (paymentResponse.data.data?.CustomerMessage?.includes('MOCK')) {
            toast.success('Order created successfully! (M-Pesa not configured - using mock payment)');
          } else {
            toast.success('Payment initiated! Check your phone for M-Pesa prompt.');
          }
          
          // Clear cart
          clearCart();
          
          // Navigate to orders page
          navigate('/buyer/orders');
        } catch (paymentError: any) {
          const errorMessage = paymentError.response?.data?.message || 'Failed to initiate payment';
          toast.error(errorMessage);
          // Don't clear cart or navigate if payment fails
          return;
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/buyer')}
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your delivery address"
                    value={delivery.address}
                    onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      County
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="County"
                      value={delivery.county}
                      onChange={(e) => setDelivery({ ...delivery, county: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-County
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Sub-County"
                      value={delivery.subCounty}
                      onChange={(e) => setDelivery({ ...delivery, subCounty: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (M-Pesa)
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="254712345678"
                    value={delivery.phone}
                    onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This number will receive the M-Pesa payment prompt
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-primary-600 rounded-md cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="mpesa"
                    checked={paymentMethod === 'mpesa'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold">M-Pesa</div>
                    <div className="text-sm text-gray-600">
                      Pay via M-Pesa mobile money
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Pay KES ${getTotal().toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="text-gray-900">
                    KES {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>KES {getTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

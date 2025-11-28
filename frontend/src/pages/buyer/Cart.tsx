import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/buyer/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link
            to="/buyer"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow divide-y">
            {items.map((item) => (
              <div key={item.productId} className="p-6 flex items-center space-x-4">
                {item.product?.images && item.product.images.length > 0 ? (
                  <img
                    src={item.product.images[0]}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    {item.product?.location?.county || 'N/A'}
                  </p>
                  <p className="text-primary-600 font-semibold">
                    KES {item.price}/{item.unit}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 border-x border-gray-300">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      removeItem(item.productId);
                      toast.success('Item removed from cart');
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={() => {
                clearCart();
                toast.success('Cart cleared');
              }}
              className="text-red-600 hover:text-red-700"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>KES {getTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>KES 0</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>KES {getTotal().toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/buyer"
              className="block mt-4 text-center text-primary-600 hover:text-primary-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

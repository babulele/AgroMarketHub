import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Product, Order } from '../../types';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  activeProducts: number;
  lowStockProducts: number;
}

const DashboardHome = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeProducts: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products
      const productsResponse = await api.get('/products');
      const products: Product[] = productsResponse.data.data.products || [];
      
      // Fetch orders
      const ordersResponse = await api.get('/orders');
      const orders: Order[] = ordersResponse.data.data.orders || [];

      // Calculate stats
      const totalProducts = products.length;
      const activeProducts = products.filter((p) => p.inventory?.available).length;
      const lowStockProducts = products.filter(
        (p) => p.inventory?.quantity && p.inventory.quantity < 10
      ).length;
      
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(
        (o) => o.status === 'pending' || o.status === 'confirmed'
      ).length;
      const totalSales = orders
        .filter((o) => o.status === 'delivered' && o.payment?.status === 'completed')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      setStats({
        totalProducts,
        totalSales,
        totalOrders,
        pendingOrders,
        activeProducts,
        lowStockProducts,
      });

      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));

      // Get recent products (last 5)
      setRecentProducts(products.slice(0, 5));
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      picking: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeProducts} active
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                KES {stats.totalSales.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.pendingOrders} pending
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeProducts}</p>
              <p className="text-xs text-gray-500 mt-1">Currently listed</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Alert</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.lowStockProducts}</p>
              <p className="text-xs text-gray-500 mt-1">Need restocking</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quick Actions</p>
              <div className="mt-3 space-y-2">
                <Link
                  to="/farmer/products"
                  className="block text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Add New Product →
                </Link>
                <Link
                  to="/farmer/ai-dashboard"
                  className="block text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View AI Insights →
                </Link>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders and Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <Link
                to="/farmer/sales"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                <p>No orders yet</p>
                <p className="text-sm mt-2">Start listing products to get orders!</p>
              </div>
            ) : (
              recentOrders.map((order) => (
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
                        {order.items.slice(0, 2).map((item, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            {item.name} - {item.quantity} {item.unit}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-gray-500">
                            +{order.items.length - 2} more items
                          </p>
                        )}
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

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Your Products</h2>
              <Link
                to="/farmer/products"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Manage all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentProducts.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                <p>No products listed yet</p>
                <Link
                  to="/farmer/products"
                  className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
                >
                  Add Your First Product
                </Link>
              </div>
            ) : (
              recentProducts.map((product) => (
                <div key={product._id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">
                          Stock: {product.inventory?.quantity || 0} {product.unit}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            product.inventory?.available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.inventory?.available ? 'Active' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900">
                        KES {product.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">per {product.unit}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;


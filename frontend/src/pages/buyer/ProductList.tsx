import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import api from '../../services/api';
import { Product } from '../../types';
import toast from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';

const ProductList = () => {
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    county: '',
    minPrice: '',
    maxPrice: '',
    search: '',
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.county) params.append('county', filters.county);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data.products);
    } catch (error: any) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading products...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <div className="flex space-x-2">
            <Link
              to="/buyer/seasonal"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              View Seasonal Products
            </Link>
            <Link
              to="/buyer/auctions"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
            >
              Browse Auctions
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search products..."
            className="px-4 py-2 border border-gray-300 rounded-md"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-md"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="grains">Grains</option>
          </select>
          <input
            type="text"
            placeholder="Min Price"
            className="px-4 py-2 border border-gray-300 rounded-md"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
          <input
            type="text"
            placeholder="Max Price"
            className="px-4 py-2 border border-gray-300 rounded-md"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link to={`/buyer/product/${product._id}`}>
              {product.images && product.images.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
            </Link>
            <div className="p-4">
              <Link to={`/buyer/product/${product._id}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600">
                  {product.name}
                </h3>
              </Link>
              {/* Rating Display */}
              {product.averageRating && product.averageRating > 0 && (
                <div className="flex items-center space-x-1 mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`w-3 h-3 ${
                          star <= Math.round(product.averageRating!)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    {product.averageRating.toFixed(1)}
                    {product.totalReviews && product.totalReviews > 0 && (
                      <span className="ml-1">({product.totalReviews})</span>
                    )}
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-600 mb-2">{product.description.substring(0, 60)}...</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-bold text-primary-600">
                  KES {product.price}/{product.unit}
                </span>
                <span className="text-sm text-gray-500">
                  {product.location.county}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Sold by{' '}
                <Link
                  to={`/buyer/farmer/${product.farmer._id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {product.farmer.firstName} {product.farmer.lastName}
                </Link>
              </p>
              <button
                onClick={() => {
                  addItem(product, 1);
                  toast.success('Added to cart!');
                }}
                disabled={!product.inventory.available}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;


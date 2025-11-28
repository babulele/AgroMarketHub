import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';
import ImageGallery from '../../components/ImageGallery';
import ReviewList from '../../components/ReviewList';
import { FaStar } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data.product);
    } catch (error: any) {
      toast.error('Failed to load product');
      navigate('/buyer');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (quantity > product.inventory.quantity) {
      toast.error('Insufficient inventory');
      return;
    }

    addItem(product, quantity);
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (quantity > product.inventory.quantity) {
      toast.error('Insufficient inventory');
      return;
    }

    addItem(product, quantity);
    navigate('/buyer/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Product not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/buyer')}
        className="mb-4 text-primary-600 hover:text-primary-700"
      >
        ← Back to Marketplace
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Product Images */}
          <div>
            <ImageGallery images={product.images || []} alt={product.name} />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {/* Rating Display */}
            {product.averageRating && product.averageRating > 0 && (
              <div className="mb-3 flex items-center space-x-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(product.averageRating!)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {product.averageRating.toFixed(1)}
                </span>
                {product.totalReviews && product.totalReviews > 0 && (
                  <span className="text-sm text-gray-600">
                    ({product.totalReviews} {product.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                )}
              </div>
            )}
            
            <div className="mb-4">
              <span className="text-3xl font-bold text-primary-600">
                KES {product.price}
              </span>
              <span className="text-gray-600 ml-2">/{product.unit}</span>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">{product.description}</p>
              
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Category:</span>{' '}
                  <span className="text-gray-600">{product.category}</span>
                </div>
                <div>
                  <span className="font-semibold">Location:</span>{' '}
                  <span className="text-gray-600">
                    {product.location.county}, {product.location.subCounty}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Available:</span>{' '}
                  <span
                    className={
                      product.inventory.available
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {product.inventory.quantity} {product.unit}
                  </span>
                </div>
                {product.farmer && (
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Farmer:</span>
                    <span className="text-gray-700">
                      {product.farmer.firstName} {product.farmer.lastName}
                    </span>
                    <Link
                      to={`/buyer/farmer/${product.farmer._id}`}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      View profile →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.inventory.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.inventory.quantity, parseInt(e.target.value) || 1)))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.inventory.quantity, quantity + 1))}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={quantity >= product.inventory.quantity}
                >
                  +
                </button>
                <span className="text-sm text-gray-600">
                  Max: {product.inventory.quantity} {product.unit}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inventory.available || quantity > product.inventory.quantity}
                className="flex-1 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inventory.available || quantity > product.inventory.quantity}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        <ReviewList productId={product._id} />
      </div>
    </div>
  );
};

export default ProductDetail;

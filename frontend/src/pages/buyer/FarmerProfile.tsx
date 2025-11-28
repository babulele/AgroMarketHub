import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaCheckCircle, FaMapMarkerAlt, FaSeedling, FaStar, FaTractor } from 'react-icons/fa';
import api from '../../services/api';
import { FarmerPublicProfile } from '../../types';
import toast from 'react-hot-toast';

const FarmerProfile = () => {
  const { farmerId } = useParams<{ farmerId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FarmerPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (farmerId) {
      fetchProfile(farmerId);
    }
  }, [farmerId]);

  const fetchProfile = async (id: string) => {
    try {
      const response = await api.get(`/users/farmers/${id}/profile`);
      setProfile(response.data.data);
    } catch (error: any) {
      toast.error('Unable to load farmer profile');
      navigate('/buyer');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center text-gray-600">Loading farmer profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center text-gray-600">Farmer profile not found.</div>
        <button
          onClick={() => navigate('/buyer')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const { farmer, stats, products, recentReviews } = profile;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="text-primary-600 hover:text-primary-700"
      >
        ← Back
      </button>

      <div className="bg-white rounded-xl shadow p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {farmer.firstName} {farmer.lastName}
              </h1>
              {farmer.verificationStatus === 'approved' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <FaCheckCircle className="mr-1" />
                  Verified Farmer
                </span>
              )}
            </div>
            <div className="mt-3 space-y-2 text-gray-600">
              {farmer.farmLocation && (
                <div className="flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-primary-600" />
                  <span>
                    {farmer.farmLocation.county}, {farmer.farmLocation.subCounty}
                  </span>
                </div>
              )}
              <p>Member since {farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : 'N/A'}</p>
              {farmer.phone && <p>Contact: {farmer.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold text-green-700">
                {stats.averageRating.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">{stats.totalReviews} reviews</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-3xl font-bold text-blue-700">{stats.totalProducts}</p>
              <p className="text-xs text-gray-500">In marketplace</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
          <FaSeedling className="text-3xl text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Total Inventory</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalInventory}</p>
            <p className="text-xs text-gray-500">Units available</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
          <FaTractor className="text-3xl text-yellow-500" />
          <div>
            <p className="text-sm text-gray-500">Avg. Price</p>
            <p className="text-2xl font-semibold text-gray-900">
              KES {stats.averagePrice.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500">Per unit</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-2">Rating Breakdown</p>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <span className="text-xs w-8">{rating}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full mx-2">
                  <div
                    className="h-2 rounded-full bg-primary-500"
                    style={{
                      width: stats.totalReviews
                        ? `${(stats.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5] / stats.totalReviews) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
                <span className="text-xs w-8 text-right">
                  {stats.ratingDistribution[rating as 1 | 2 | 3 | 4 | 5]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Products from this Farmer</h2>
          <span className="text-sm text-gray-500">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </span>
        </div>
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
            This farmer hasn’t listed any products yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                to={`/buyer/product/${product._id}`}
                key={product._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                {product.images?.length ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <span className="text-sm text-gray-500">{product.category}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary-600">
                      KES {product.price}/{product.unit}
                    </span>
                    {product.averageRating && product.averageRating > 0 && (
                      <div className="flex items-center text-sm text-yellow-500">
                        <FaStar className="mr-1" />
                        {product.averageRating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {product.location.county}, {product.location.subCounty}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Reviews</h2>
        {recentReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-gray-600">
            No reviews yet. Be the first to order from this farmer!
          </div>
        ) : (
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating ? 'text-yellow-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {review.buyer
                        ? `${review.buyer.firstName} ${review.buyer.lastName}`
                        : 'Verified buyer'}
                      {' • '}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {review.product && typeof review.product !== 'string' && (
                    <Link
                      to={`/buyer/product/${review.product._id}`}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      View product →
                    </Link>
                  )}
                </div>
                <p className="mt-3 text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FarmerProfile;


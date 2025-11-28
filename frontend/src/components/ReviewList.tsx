import { useEffect, useState } from 'react';
import api from '../services/api';
import { Review, ReviewStats } from '../types';
import { FaStar, FaThumbsUp } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ReviewListProps {
  productId: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    fetchReviews();
  }, [productId, sort]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}?sort=${sort}`);
      setReviews(response.data.data.reviews);
      setStats(response.data.data.stats);
    } catch (error: any) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      fetchReviews(); // Refresh to update helpful count
    } catch (error: any) {
      toast.error('Failed to mark as helpful');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Review Stats */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">{stats.averageRating}</span>
              <div className="flex items-center">
                {renderStars(Math.round(stats.averageRating))}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <div className="text-right">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center space-x-2 text-sm mb-1">
                <span className="w-8">{star}</span>
                <FaStar className="w-4 h-4 text-yellow-400" />
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${(stats.distribution[star as keyof typeof stats.distribution] / stats.totalReviews) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-gray-600 w-8 text-right">
                  {stats.distribution[star as keyof typeof stats.distribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="mb-4">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {review.buyer.firstName} {review.buyer.lastName}
                </p>
                {review.isVerified && (
                  <span className="text-xs text-green-600 font-medium">Verified Purchase</span>
                )}
              </div>
              <div className="text-right">
                {renderStars(review.rating)}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-3">{review.comment}</p>
            {review.images && review.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {review.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Review image ${idx + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}
            <button
              onClick={() => handleMarkHelpful(review._id)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-primary-600"
            >
              <FaThumbsUp />
              <span>Helpful ({review.helpful})</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;


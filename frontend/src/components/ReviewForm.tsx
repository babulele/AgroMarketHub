import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';

interface ReviewFormProps {
  productId: string;
  orderId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, orderId, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reviews', {
        productId,
        orderId,
        rating,
        comment: comment.trim(),
      });
      toast.success('Review submitted successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <FaStar
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Share your experience with this product..."
          maxLength={1000}
        />
        <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 characters</p>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading || rating === 0 || !comment.trim()}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;


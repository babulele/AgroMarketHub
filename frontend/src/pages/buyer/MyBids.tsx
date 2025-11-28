import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Bid } from '../../types';
import toast from 'react-hot-toast';
import { FaGavel, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const MyBids = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const response = await api.get('/auctions/buyer/my-bids');
      setBids(response.data.data.bids || []);
    } catch (error: any) {
      toast.error('Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading your bids...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bids</h1>

      {bids.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaGavel className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">You haven't placed any bids yet.</p>
          <Link
            to="/buyer/auctions"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Browse Auctions
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => {
            const auction = typeof bid.auction === 'object' ? bid.auction : null;
            const product = auction && typeof auction.product === 'object' ? auction.product : null;

            return (
              <div
                key={bid._id}
                className={`bg-white rounded-lg shadow p-6 ${
                  bid.isWinning ? 'border-2 border-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {auction?.title || 'Auction'}
                      </h3>
                      {bid.isWinning && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                          <FaCheckCircle className="mr-1" />
                          Winning Bid
                        </span>
                      )}
                    </div>

                    {product && (
                      <p className="text-sm text-gray-600 mb-2">{product.name}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Your Bid:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          KES {bid.amount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {bid.quantity} {auction?.unit || 'units'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Value:</span>
                        <span className="ml-2 font-semibold text-primary-600">
                          KES {(bid.amount * bid.quantity).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Placed:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(bid.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {auction && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Auction Status:</p>
                            <span className={`text-sm font-medium ${
                              auction.status === 'active' ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {auction.status.toUpperCase()}
                            </span>
                          </div>
                          <Link
                            to={`/buyer/auctions/${auction._id}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View Auction →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBids;



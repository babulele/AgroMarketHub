import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Auction } from '../../types';
import toast from 'react-hot-toast';
import { FaGavel, FaPlus, FaClock, FaCheckCircle } from 'react-icons/fa';
import CreateAuctionModal from '../../components/CreateAuctionModal';

const FarmerAuctions = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchAuctions();
  }, [statusFilter]);

  const fetchAuctions = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const response = await api.get(`/auctions/farmer/my-auctions${params}`);
      setAuctions(response.data.data.auctions || []);
    } catch (error: any) {
      toast.error('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAuction = async (auctionId: string) => {
    if (!window.confirm('Are you sure you want to close this auction?')) {
      return;
    }

    try {
      await api.put(`/auctions/${auctionId}/close`);
      toast.success('Auction closed successfully');
      fetchAuctions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to close auction');
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      closed: 'bg-red-100 text-red-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading auctions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Auctions</h1>
        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Create Auction</span>
          </button>
        </div>
      </div>

      {auctions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaGavel className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">You haven't created any auctions yet.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Create Your First Auction
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => {
            const product = typeof auction.product === 'object' ? auction.product : null;
            const timeRemaining = getTimeRemaining(auction.endDate);

            return (
              <div
                key={auction._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {auction.images && auction.images.length > 0 ? (
                  <img
                    src={auction.images[0]}
                    alt={auction.title}
                    className="w-full h-48 object-cover"
                  />
                ) : product?.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={auction.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <FaGavel className="text-4xl text-gray-400" />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{auction.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(auction.status)}`}>
                      {auction.status.toUpperCase()}
                    </span>
                  </div>

                  {product && (
                    <p className="text-sm text-gray-600 mb-2">{product.name}</p>
                  )}

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Starting Price:</span>
                      <span className="font-semibold">KES {auction.startingPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Bid:</span>
                      <span className="font-semibold text-primary-600">
                        KES {(auction.currentHighestBid || auction.startingPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-semibold">{auction.quantity} {auction.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bids:</span>
                      <span className="font-semibold">
                        {auction.bids?.length || 0} {auction.bids?.length === 1 ? 'bid' : 'bids'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Time:</span>
                      <span className={timeRemaining === 'Ended' ? 'text-red-600 font-semibold' : ''}>
                        {timeRemaining}
                      </span>
                    </div>
                  </div>

                  {auction.winningBid && typeof auction.winningBid === 'object' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                      <div className="flex items-center text-sm text-green-800">
                        <FaCheckCircle className="mr-1" />
                        <span>Winning Bid: KES {auction.winningBid.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 mt-4">
                    <Link
                      to={`/farmer/auctions/${auction._id}`}
                      className="flex-1 text-center px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                    >
                      View Details
                    </Link>
                    {auction.status === 'active' && (
                      <button
                        onClick={() => handleCloseAuction(auction._id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateAuctionModal
          onClose={() => {
            setShowCreateModal(false);
            fetchAuctions();
          }}
        />
      )}
    </div>
  );
};

export default FarmerAuctions;



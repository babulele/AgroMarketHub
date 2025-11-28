import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Auction } from '../../types';
import toast from 'react-hot-toast';
import { FaGavel, FaClock, FaMapMarkerAlt, FaTag } from 'react-icons/fa';

const Auctions = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'active',
    county: '',
    category: '',
  });

  useEffect(() => {
    fetchAuctions();
  }, [filters]);

  const fetchAuctions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.county) params.append('county', filters.county);
      if (filters.category) params.append('category', filters.category);

      const response = await api.get(`/auctions?${params.toString()}`);
      setAuctions(response.data.data.auctions || []);
    } catch (error: any) {
      toast.error('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Bulk Buying Auctions</h1>
        <p className="text-gray-600 mb-6">
          Bid on bulk quantities of fresh produce directly from farmers. Perfect for restaurants, retailers, and bulk buyers.
        </p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="active">Active Auctions</option>
            <option value="draft">Upcoming</option>
            <option value="closed">Closed</option>
          </select>
          <input
            type="text"
            placeholder="Filter by County"
            value={filters.county}
            onChange={(e) => setFilters({ ...filters, county: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="grains">Grains</option>
          </select>
        </div>
      </div>

      {/* Auctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction) => {
          const product = typeof auction.product === 'object' ? auction.product : null;
          const timeRemaining = getTimeRemaining(auction.endDate);

          return (
            <Link
              key={auction._id}
              to={`/buyer/auctions/${auction._id}`}
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
                  <div className="flex items-center text-sm text-gray-600">
                    <FaTag className="mr-2" />
                    <span className="font-semibold text-primary-600">
                      Current Bid: KES {auction.currentHighestBid?.toLocaleString() || auction.startingPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaGavel className="mr-2" />
                    <span>Quantity: {auction.quantity} {auction.unit}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{auction.location.county}, {auction.location.subCounty}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaClock className="mr-2" />
                    <span className={timeRemaining === 'Ended' ? 'text-red-600 font-semibold' : ''}>
                      {timeRemaining}
                    </span>
                  </div>
                </div>

                {auction.reservePrice && (
                  <div className="text-xs text-gray-500 mb-2">
                    Reserve Price: KES {auction.reservePrice.toLocaleString()}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Starting Price:</span>
                    <span className="font-semibold text-gray-900">
                      KES {auction.startingPrice.toLocaleString()}
                    </span>
                  </div>
                  {auction.bids && auction.bids.length > 0 && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600">Bids:</span>
                      <span className="font-semibold text-primary-600">
                        {auction.bids.length} {auction.bids.length === 1 ? 'bid' : 'bids'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {auctions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaGavel className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No auctions found for the selected filters.</p>
          <button
            onClick={() => setFilters({ status: 'active', county: '', category: '' })}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Auctions;



import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Auction, Bid } from '../../types';
import toast from 'react-hot-toast';
import { FaGavel, FaClock, FaMapMarkerAlt, FaTag, FaUser } from 'react-icons/fa';
import ImageGallery from '../../components/ImageGallery';

const AuctionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidQuantity, setBidQuantity] = useState(1);
  const [placingBid, setPlacingBid] = useState(false);

  useEffect(() => {
    fetchAuction();
  }, [id]);

  const fetchAuction = async () => {
    try {
      const response = await api.get(`/auctions/${id}`);
      setAuction(response.data.data.auction);
      if (response.data.data.auction.currentHighestBid) {
        setBidAmount((response.data.data.auction.currentHighestBid + response.data.data.auction.minimumBidIncrement).toString());
      } else {
        setBidAmount((response.data.data.auction.startingPrice + response.data.data.auction.minimumBidIncrement).toString());
      }
    } catch (error: any) {
      toast.error('Failed to load auction');
      navigate('/buyer/auctions');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bidAmount || !bidQuantity) {
      toast.error('Please enter bid amount and quantity');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    if (bidQuantity < 1 || bidQuantity > (auction?.quantity || 0)) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setPlacingBid(true);
    try {
      await api.post(`/auctions/${id}/bid`, {
        amount,
        quantity: bidQuantity,
      });
      toast.success('Bid placed successfully!');
      fetchAuction(); // Refresh auction data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setPlacingBid(false);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return { ended: true, text: 'Auction Ended' };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return { ended: false, text: `${days} days, ${hours} hours, ${minutes} minutes` };
    if (hours > 0) return { ended: false, text: `${hours} hours, ${minutes} minutes` };
    return { ended: false, text: `${minutes} minutes` };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading auction...</div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Auction not found</div>
      </div>
    );
  }

  const product = typeof auction.product === 'object' ? auction.product : null;
  const timeRemaining = getTimeRemaining(auction.endDate);
  const isActive = auction.status === 'active' && !timeRemaining.ended;
  const minBid = (auction.currentHighestBid || auction.startingPrice) + auction.minimumBidIncrement;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/buyer/auctions')}
        className="mb-4 text-primary-600 hover:text-primary-700"
      >
        ← Back to Auctions
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Images */}
            {(auction.images && auction.images.length > 0) || (product?.images && product.images.length > 0) ? (
              <ImageGallery
                images={auction.images.length > 0 ? auction.images : (product?.images || [])}
                alt={auction.title}
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <FaGavel className="text-6xl text-gray-400" />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{auction.title}</h1>
                  {product && (
                    <p className="text-lg text-gray-600">{product.name}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {auction.status.toUpperCase()}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{auction.description}</p>
              </div>

              {/* Auction Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-1">
                    <FaTag className="mr-2" />
                    <span className="text-sm">Starting Price</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    KES {auction.startingPrice.toLocaleString()}
                  </p>
                </div>
                <div className="bg-primary-50 p-4 rounded-lg">
                  <div className="flex items-center text-primary-600 mb-1">
                    <FaGavel className="mr-2" />
                    <span className="text-sm">Current Highest Bid</span>
                  </div>
                  <p className="text-xl font-bold text-primary-600">
                    KES {(auction.currentHighestBid || auction.startingPrice).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-1">
                    <FaGavel className="mr-2" />
                    <span className="text-sm">Quantity Available</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {auction.quantity} {auction.unit}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-1">
                    <FaClock className="mr-2" />
                    <span className="text-sm">Time Remaining</span>
                  </div>
                  <p className={`text-xl font-bold ${timeRemaining.ended ? 'text-red-600' : 'text-gray-900'}`}>
                    {timeRemaining.text}
                  </p>
                </div>
              </div>

              {auction.reservePrice && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Reserve Price:</strong> KES {auction.reservePrice.toLocaleString()} - 
                    Your bid must meet or exceed this price to win.
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="flex items-center text-gray-600 mb-6">
                <FaMapMarkerAlt className="mr-2" />
                <span>{auction.location.county}, {auction.location.subCounty}</span>
              </div>

              {/* Bids History */}
              {auction.bids && auction.bids.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Bidding History</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {auction.bids
                      .sort((a: Bid, b: Bid) => b.amount - a.amount)
                      .map((bid: Bid, index: number) => (
                        <div
                          key={bid._id}
                          className={`p-3 rounded-lg ${
                            bid.isWinning ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FaUser className="mr-2 text-gray-600" />
                              <span className="font-medium text-gray-900">
                                {typeof bid.buyer === 'object' 
                                  ? `${bid.buyer.firstName} ${bid.buyer.lastName}`
                                  : 'Anonymous'}
                              </span>
                              {bid.isWinning && (
                                <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                                  Winning
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">KES {bid.amount.toLocaleString()}</p>
                              <p className="text-xs text-gray-600">
                                {bid.quantity} {auction.unit} • {new Date(bid.submittedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bidding Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Place Your Bid</h2>

            {!isActive ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  {timeRemaining.ended ? 'This auction has ended.' : 'This auction is not active.'}
                </p>
                {auction.winningBid && typeof auction.winningBid === 'object' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>Winner:</strong> {typeof auction.winningBid.buyer === 'object'
                        ? `${auction.winningBid.buyer.firstName} ${auction.winningBid.buyer.lastName}`
                        : 'Anonymous'}
                    </p>
                    <p className="text-sm text-green-800 mt-1">
                      <strong>Winning Bid:</strong> KES {auction.winningBid.amount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handlePlaceBid}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bid Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={minBid}
                    step={auction.minimumBidIncrement}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum bid: KES {minBid.toLocaleString()} (Current: KES {(auction.currentHighestBid || auction.startingPrice).toLocaleString()} + Increment: KES {auction.minimumBidIncrement})
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity ({auction.unit})
                  </label>
                  <input
                    type="number"
                    value={bidQuantity}
                    onChange={(e) => setBidQuantity(Math.max(1, Math.min(auction.quantity, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={auction.quantity}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {auction.quantity} {auction.unit}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Total Bid Value:</strong> KES {(parseFloat(bidAmount) * bidQuantity || 0).toLocaleString()}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={placingBid || parseFloat(bidAmount) < minBid}
                  className="w-full px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placingBid ? 'Placing Bid...' : 'Place Bid'}
                </button>
              </form>
            )}

            {/* Farmer Info */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">Farmer</h3>
              <p className="text-sm text-gray-600">
                {typeof auction.farmer === 'object'
                  ? `${auction.farmer.firstName} ${auction.farmer.lastName}`
                  : 'Unknown'}
              </p>
              {typeof auction.farmer === 'object' && auction.farmer.farmLocation && (
                <p className="text-xs text-gray-500 mt-1">
                  {auction.farmer.farmLocation.county}, {auction.farmer.farmLocation.subCounty}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;



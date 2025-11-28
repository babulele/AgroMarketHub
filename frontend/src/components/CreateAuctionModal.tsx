import { useState, useEffect } from 'react';
import api from '../services/api';
import { Product } from '../types';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';

interface CreateAuctionModalProps {
  onClose: () => void;
}

const CreateAuctionModal: React.FC<CreateAuctionModalProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    title: '',
    description: '',
    startingPrice: '',
    reservePrice: '',
    quantity: '',
    unit: 'kg',
    startDate: '',
    endDate: '',
    minimumBidIncrement: '50',
    location: { county: '', subCounty: '' },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      const availableProducts = (response.data.data.products || []).filter(
        (p: Product) => p.inventory.quantity > 0
      );
      setProducts(availableProducts);
    } catch (error: any) {
      toast.error('Failed to load products');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.productId || !formData.title || !formData.description || 
          !formData.startingPrice || !formData.quantity || !formData.startDate || 
          !formData.endDate || !formData.location.county || !formData.location.subCounty) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const now = new Date();

      if (startDate < now) {
        toast.error('Start date must be in the future');
        setLoading(false);
        return;
      }

      if (endDate <= startDate) {
        toast.error('End date must be after start date');
        setLoading(false);
        return;
      }

      const selectedProduct = products.find((p) => p._id === formData.productId);
      if (selectedProduct && parseInt(formData.quantity) > selectedProduct.inventory.quantity) {
        toast.error('Quantity exceeds available inventory');
        setLoading(false);
        return;
      }

      await api.post('/auctions', {
        ...formData,
        startingPrice: parseFloat(formData.startingPrice),
        reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : undefined,
        quantity: parseInt(formData.quantity),
        minimumBidIncrement: parseInt(formData.minimumBidIncrement),
      });

      toast.success('Auction created successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      setFormData({
        ...formData,
        productId,
        unit: product.unit,
        location: product.location,
        quantity: Math.min(formData.quantity ? parseInt(formData.quantity) : 1, product.inventory.quantity).toString(),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Create New Auction</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product *
              </label>
              <select
                value={formData.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Choose a product...</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - {product.inventory.quantity} {product.unit} available
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auction Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Fresh Maize Bulk Sale"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe your auction..."
                required
              />
            </div>

            {/* Price and Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Price (KES) *
                </label>
                <input
                  type="number"
                  value={formData.startingPrice}
                  onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reserve Price (KES) <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={formData.reservePrice}
                  onChange={(e) => setFormData({ ...formData, reservePrice: e.target.value })}
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  County *
                </label>
                <input
                  type="text"
                  value={formData.location.county}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, county: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-County *
                </label>
                <input
                  type="text"
                  value={formData.location.subCounty}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, subCounty: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            {/* Minimum Bid Increment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Bid Increment (KES)
              </label>
              <input
                type="number"
                value={formData.minimumBidIncrement}
                onChange={(e) => setFormData({ ...formData, minimumBidIncrement: e.target.value })}
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum amount by which a new bid must exceed the current highest bid
              </p>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Auction'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuctionModal;



import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import api from '../../services/api';
import { Product } from '../../types';
import toast from 'react-hot-toast';
import { FaStar, FaLeaf, FaSun, FaSnowflake, FaCloudRain } from 'react-icons/fa';

// Define seasonal availability for common crops in Kenya
const SEASONAL_CROPS: Record<string, { season: string; months: number[]; icon: any }> = {
  'Maize': { season: 'Long Rains', months: [3, 4, 5, 6], icon: FaCloudRain },
  'Beans': { season: 'Long Rains', months: [3, 4, 5, 6], icon: FaCloudRain },
  'Tomatoes': { season: 'Year Round', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], icon: FaSun },
  'Onions': { season: 'Short Rains', months: [10, 11, 12, 1], icon: FaLeaf },
  'Potatoes': { season: 'Long Rains', months: [3, 4, 5, 6], icon: FaCloudRain },
  'Cabbage': { season: 'Year Round', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], icon: FaSun },
  'Carrots': { season: 'Year Round', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], icon: FaSun },
  'Wheat': { season: 'Long Rains', months: [3, 4, 5, 6], icon: FaCloudRain },
  'Rice': { season: 'Long Rains', months: [3, 4, 5, 6], icon: FaCloudRain },
  'Mangoes': { season: 'Dry Season', months: [12, 1, 2, 3], icon: FaSun },
  'Avocados': { season: 'Year Round', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], icon: FaSun },
  'Bananas': { season: 'Year Round', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], icon: FaSun },
};

const SEASONS = [
  { name: 'All Seasons', value: 'all', months: [] },
  { name: 'Long Rains (Mar-Jun)', value: 'long_rains', months: [3, 4, 5, 6] },
  { name: 'Short Rains (Oct-Jan)', value: 'short_rains', months: [10, 11, 12, 1] },
  { name: 'Dry Season (Dec-Mar)', value: 'dry', months: [12, 1, 2, 3] },
  { name: 'Year Round', value: 'year_round', months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
];

const SeasonalProducts = () => {
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState('all');
  const currentMonth = new Date().getMonth() + 1; // 1-12

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedSeason]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data.products || []);
    } catch (error: any) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (selectedSeason === 'all') {
      setFilteredProducts(products);
      return;
    }

    const season = SEASONS.find((s) => s.value === selectedSeason);
    if (!season) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) => {
      const cropInfo = SEASONAL_CROPS[product.name];
      if (!cropInfo) return true; // Include products we don't have seasonal data for

      if (selectedSeason === 'year_round') {
        return cropInfo.months.length === 12;
      }

      // Check if product is available in selected season months
      return season.months.some((month) => cropInfo.months.includes(month));
    });

    setFilteredProducts(filtered);
  };

  const isCurrentlyInSeason = (productName: string): boolean => {
    const cropInfo = SEASONAL_CROPS[productName];
    if (!cropInfo) return false;
    return cropInfo.months.includes(currentMonth);
  };

  const getSeasonInfo = (productName: string) => {
    return SEASONAL_CROPS[productName] || null;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading seasonal products...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Seasonal Products</h1>
        <p className="text-gray-600 mb-6">
          Discover products that are in season now or coming soon. Seasonal produce is fresher, more
          affordable, and supports local farmers.
        </p>

        {/* Season Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Season
          </label>
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((season) => (
              <button
                key={season.value}
                onClick={() => setSelectedSeason(season.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedSeason === season.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {season.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Month Highlight */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-primary-800">
            <strong>Current Month:</strong> {new Date().toLocaleString('default', { month: 'long' })}{' '}
            - Showing products available during this time
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const seasonInfo = getSeasonInfo(product.name);
          const inSeason = isCurrentlyInSeason(product.name);
          const SeasonIcon = seasonInfo?.icon || FaLeaf;

          return (
            <div
              key={product._id}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                inSeason ? 'ring-2 ring-green-400' : ''
              }`}
            >
              <Link to={`/buyer/product/${product._id}`}>
                {product.images && product.images.length > 0 && (
                  <div className="relative">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {inSeason && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <FaLeaf />
                        <span>In Season</span>
                      </div>
                    )}
                  </div>
                )}
              </Link>
              <div className="p-4">
                <Link to={`/buyer/product/${product._id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600">
                    {product.name}
                  </h3>
                </Link>

                {/* Season Info */}
                {seasonInfo && (
                  <div className="mb-2 flex items-center space-x-2 text-sm">
                    <SeasonIcon className="text-primary-600" />
                    <span className="text-gray-600">{seasonInfo.season}</span>
                  </div>
                )}

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
                    </span>
                  </div>
                )}

                <p className="text-sm text-gray-600 mb-2">
                  {product.description.substring(0, 60)}...
                </p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xl font-bold text-primary-600">
                    KES {product.price}/{product.unit}
                  </span>
                  <span className="text-sm text-gray-500">{product.location.county}</span>
                </div>
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
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No products found for the selected season.</p>
          <button
            onClick={() => setSelectedSeason('all')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Show All Products
          </button>
        </div>
      )}
    </div>
  );
};

export default SeasonalProducts;


import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Stats {
  totalUsers: number;
  totalFarmers: number;
  totalBuyers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [regionalData, setRegionalData] = useState<any[]>([]);
  const [marketPrices, setMarketPrices] = useState<any[]>([]);
  const [scarcityData, setScarcityData] = useState<any[]>([]);
  const [buyerActivity, setBuyerActivity] = useState<any[]>([]);
  const [supplyDemand, setSupplyDemand] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<number>(30);

  useEffect(() => {
    fetchStats();
    fetchRegionalData();
    fetchMarketPrices();
    fetchFoodScarcity();
    fetchBuyerActivity();
    fetchSupplyDemand();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data.stats);
    } catch (error: any) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegionalData = async () => {
    try {
      const response = await api.get('/admin/regional-data');
      setRegionalData(response.data.data.regionalData || []);
    } catch (error: any) {
      console.error('Failed to load regional data:', error);
    }
  };

  const fetchMarketPrices = async () => {
    try {
      const response = await api.get(`/admin/market-prices?days=${timeRange}`);
      setMarketPrices(response.data.data.priceData || []);
    } catch (error: any) {
      console.error('Failed to load market prices:', error);
    }
  };

  const fetchFoodScarcity = async () => {
    try {
      const response = await api.get(`/admin/food-scarcity?days=${timeRange}`);
      setScarcityData(response.data.data.scarcityData || []);
    } catch (error: any) {
      console.error('Failed to load food scarcity data:', error);
    }
  };

  const fetchBuyerActivity = async () => {
    try {
      const response = await api.get(`/admin/buyer-activity?days=${timeRange}`);
      setBuyerActivity(response.data.data.buyerActivity || []);
    } catch (error: any) {
      console.error('Failed to load buyer activity:', error);
    }
  };

  const fetchSupplyDemand = async () => {
    try {
      const response = await api.get('/admin/supply-demand');
      setSupplyDemand(response.data.data.analysis || []);
    } catch (error: any) {
      console.error('Failed to load supply/demand analysis:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Big Data Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Farmers</h3>
            <p className="text-3xl font-bold text-primary-600">{stats.totalFarmers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Buyers</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalBuyers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">
              KES {stats.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Regional Data */}
      {regionalData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Regional Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionalData.map((region: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{region.county}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Products:</span>
                    <span className="font-semibold">{region.productCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inventory:</span>
                    <span className="font-semibold">{region.totalInventory || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Price:</span>
                    <span className="font-semibold">
                      KES {region.averagePrice?.toFixed(2) || '0'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Prices Visualization */}
      {marketPrices.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Market Prices Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={marketPrices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {Object.keys(marketPrices[0] || {})
                .filter((key) => key !== 'date')
                .slice(0, 5)
                .map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    name={key === 'all' ? 'All Categories' : key}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Food Scarcity Trends */}
      {scarcityData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Food Scarcity Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scarcityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {Object.keys(scarcityData[0] || {})
                .filter((key) => key !== 'date' && !key.includes('_'))
                .slice(0, 5)
                .map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    name={key}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Buyer Activity Heatmap */}
      {buyerActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Buyer Activity Heatmap</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={buyerActivity.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="county" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="orderCount" fill="#3b82f6" name="Orders" />
                <Bar dataKey="totalItems" fill="#10b981" name="Items" />
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Top Active Counties</h3>
              {buyerActivity.slice(0, 10).map((region: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">{region.county}</span>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>{region.orderCount} orders</span>
                    <span>KES {region.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Supply & Demand Analysis */}
      {supplyDemand.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Supply & Demand Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplyDemand}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="supply" fill="#3b82f6" name="Supply (Inventory)" />
                <Bar dataKey="demand" fill="#ef4444" name="Demand (Orders)" />
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Supply/Demand Ratios</h3>
              {supplyDemand
                .sort((a, b) => b.supplyDemandRatio - a.supplyDemandRatio)
                .map((item: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{item.category}</span>
                      <span className={`text-sm font-semibold ${
                        item.supplyDemandRatio > 2
                          ? 'text-green-600'
                          : item.supplyDemandRatio < 0.5
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}>
                        {item.supplyDemandRatio.toFixed(2)}x
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Supply: {item.supply.toLocaleString()} units</div>
                      <div>Demand: {item.demand.toLocaleString()} units</div>
                      <div>Avg Price: KES {item.averagePrice.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Regional Supply/Demand Chart */}
      {regionalData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Regional Supply & Demand</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={regionalData.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="county" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={120} />
              <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="productCount" fill="#3b82f6" name="Products" />
              <Bar yAxisId="left" dataKey="totalInventory" fill="#10b981" name="Inventory" />
              <Bar yAxisId="right" dataKey="totalOrders" fill="#f59e0b" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Analytics;

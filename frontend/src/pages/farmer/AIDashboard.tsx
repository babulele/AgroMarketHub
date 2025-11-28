import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import aiApi from '../../services/aiApi';
import toast from 'react-hot-toast';
import {
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

interface Forecast {
  crop: string;
  demand: number;
  confidence: number;
  priceRecommendation?: number;
}

interface RegionalData {
  county: string;
  demand_score: number;
  revenue: number;
  productCount?: number;
}

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

const AIDashboard = () => {
  const { user } = useAuthStore();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<RegionalData[]>([]);
  const [farmerInsights, setFarmerInsights] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'seasonal'>('monthly');

  useEffect(() => {
    fetchForecasts();
    fetchHeatmap();
    fetchFarmerInsights();
  }, [timeRange]);

  const fetchForecasts = async () => {
    try {
      const response = await aiApi.get(
        `/forecasts/nationwide?forecast_type=${timeRange}`
      );
      setForecasts(response.data.data.forecasts || []);
    } catch (error: any) {
      console.error('Failed to load forecasts:', error);
      // Use mock data if API fails
      setForecasts([
        { crop: 'Maize', demand: 85, confidence: 92, priceRecommendation: 45 },
        { crop: 'Beans', demand: 78, confidence: 88, priceRecommendation: 120 },
        { crop: 'Tomatoes', demand: 95, confidence: 90, priceRecommendation: 80 },
        { crop: 'Onions', demand: 72, confidence: 85, priceRecommendation: 65 },
        { crop: 'Potatoes', demand: 88, confidence: 91, priceRecommendation: 55 },
        { crop: 'Cabbage', demand: 68, confidence: 82, priceRecommendation: 40 },
        { crop: 'Carrots', demand: 75, confidence: 86, priceRecommendation: 50 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeatmap = async () => {
    try {
      const response = await aiApi.get('/forecasts/heatmap');
      const data = response.data.data;
      if (data) {
        const regionalArray = Object.entries(data).map(([county, data]: [string, any]) => ({
          county,
          demand_score: data.demand_score || 0,
          revenue: data.revenue || 0,
        }));
        setHeatmapData(regionalArray);
      }
    } catch (error: any) {
      console.error('Failed to load heatmap:', error);
      // Mock data
      setHeatmapData([
        { county: 'Nairobi', demand_score: 95, revenue: 150000 },
        { county: 'Kiambu', demand_score: 88, revenue: 120000 },
        { county: 'Nakuru', demand_score: 82, revenue: 98000 },
        { county: 'Uasin Gishu', demand_score: 75, revenue: 85000 },
        { county: 'Meru', demand_score: 70, revenue: 72000 },
      ]);
    }
  };

  const fetchFarmerInsights = async () => {
    if (!user?.id) {
      // Set default insights if no user
      setFarmerInsights({
        total_sales: 0,
        total_orders: 0,
        active_products: 0,
      });
      return;
    }
    try {
      const response = await aiApi.get(`/forecasts/farmer-insights/${user.id}`);
      setFarmerInsights(response.data.data);
    } catch (error: any) {
      console.error('Failed to load farmer insights:', error);
      // Set default insights on error
      setFarmerInsights({
        total_sales: 0,
        total_orders: 0,
        active_products: 0,
      });
    }
  };

  const getDemandColor = (demand: number) => {
    if (demand >= 80) return '#16a34a';
    if (demand >= 60) return '#eab308';
    return '#ef4444';
  };

  const handleDownloadReport = async (format: 'pdf' | 'csv') => {
    try {
      const response = await aiApi.get(
        `/reports/download/${format}`,
        {
          params: {
            forecast_type: timeRange,
            scope: 'nationwide',
          },
          responseType: 'blob',
        }
      );

      const blob = response.data;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `forecast_${timeRange}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`${format.toUpperCase()} report downloaded successfully!`);
    } catch (error: any) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    }
  };

  // Prepare data for charts
  const demandChartData = forecasts.map((f) => ({
    crop: f.crop,
    demand: f.demand,
    confidence: f.confidence,
  }));

  const priceChartData = forecasts
    .filter((f) => f.priceRecommendation)
    .map((f) => ({
      crop: f.crop,
      price: f.priceRecommendation,
      demand: f.demand,
    }));

  const regionalChartData = heatmapData.map((r) => ({
    name: r.county,
    demand: r.demand_score,
    revenue: r.revenue / 1000, // Convert to thousands
  }));

  // Top crops by demand
  const topCrops = [...forecasts]
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 5)
    .map((f) => ({
      name: f.crop,
      value: f.demand,
    }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading AI insights...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Demand Forecasting</h1>
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('weekly')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeRange === 'weekly'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeRange === 'monthly'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeRange('seasonal')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeRange === 'seasonal'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Seasonal
            </button>
          </div>
          <div className="flex space-x-2 border-l pl-3">
            <button
              onClick={() => handleDownloadReport('pdf')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>📄</span>
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleDownloadReport('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>📊</span>
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These forecasts help you plan your crops and optimize pricing.
          High demand scores indicate crops that are likely to sell well in the coming period.
          Forecasts are updated daily based on market trends, weather patterns, and historical data.
        </p>
      </div>

      {/* Farmer Insights Summary */}
      {farmerInsights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Sales</h3>
            <p className="text-3xl font-bold text-gray-900">
              KES {farmerInsights.total_sales?.toLocaleString() || '0'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-primary-600">
              {farmerInsights.total_orders || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Products</h3>
            <p className="text-3xl font-bold text-blue-600">
              {farmerInsights.active_products || 0}
            </p>
          </div>
        </div>
      )}

      {/* Demand Forecast Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Demand Forecast by Crop ({timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={demandChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="crop" angle={-45} textAnchor="end" height={100} />
            <YAxis label={{ value: 'Demand Score (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value}%`,
                name === 'demand' ? 'Demand Score' : 'Confidence',
              ]}
            />
            <Legend />
            <Bar dataKey="demand" fill="#16a34a" name="Demand Score" />
            <Bar dataKey="confidence" fill="#3b82f6" name="Confidence" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Price Recommendations Chart */}
        {priceChartData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Price Recommendations</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="crop" angle={-45} textAnchor="end" height={80} />
                <YAxis label={{ value: 'Price (KES/kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `KES ${value}/kg`} />
                <Bar dataKey="price" fill="#8b5cf6" name="Recommended Price" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Crops Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top 5 High-Demand Crops</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topCrops}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {topCrops.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Demand Heatmap */}
      {regionalChartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Regional Demand Distribution</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={regionalChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Demand Score', position: 'insideBottom' }} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'revenue') return `KES ${value}K`;
                  return `${value}%`;
                }}
              />
              <Legend />
              <Bar dataKey="demand" fill="#16a34a" name="Demand Score (%)" />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (KES '000)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Forecast Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {forecasts.map((forecast, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{forecast.crop}</h3>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getDemandColor(forecast.demand) }}
              />
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Demand Score</span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: getDemandColor(forecast.demand) }}
                  >
                    {forecast.demand}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${forecast.demand}%`,
                      backgroundColor: getDemandColor(forecast.demand),
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Confidence</span>
                <span className="font-semibold text-gray-900">{forecast.confidence}%</span>
              </div>

              {forecast.priceRecommendation && (
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Recommended Price</span>
                    <span className="text-sm font-semibold text-primary-600">
                      KES {forecast.priceRecommendation}/kg
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <div className="text-xs text-gray-500">
                  {forecast.demand >= 80 && '🔥 High demand - Consider increasing production'}
                  {forecast.demand >= 60 && forecast.demand < 80 && '📈 Moderate demand'}
                  {forecast.demand < 60 && '⚠️ Low demand - Consider alternatives'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">AI Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">High Priority Actions</h3>
            <ul className="space-y-1 text-sm text-green-800">
              <li>• Focus on crops with demand scores above 80%</li>
              <li>• Adjust pricing based on AI recommendations</li>
              <li>• Plan harvest timing to align with peak demand</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Market Insights</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Monitor regional trends for distribution optimization</li>
              <li>• Consider seasonal variations in demand</li>
              <li>• Use confidence scores to prioritize decisions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Regional Heatmap Table */}
      {heatmapData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Regional Demand Heatmap</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    County
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demand Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {heatmapData
                  .sort((a, b) => b.demand_score - a.demand_score)
                  .map((region, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {region.county}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${region.demand_score}%`,
                                backgroundColor: getDemandColor(region.demand_score),
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-900">{region.demand_score}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        KES {region.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            region.demand_score >= 80
                              ? 'bg-green-100 text-green-800'
                              : region.demand_score >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {region.demand_score >= 80
                            ? 'High'
                            : region.demand_score >= 60
                            ? 'Medium'
                            : 'Low'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDashboard;

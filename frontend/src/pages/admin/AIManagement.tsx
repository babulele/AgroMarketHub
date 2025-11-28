import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Forecast {
  _id: string;
  forecastDate: string;
  forecastType: string;
  scope: string;
  forecasts: Array<{
    crop: string;
    demand: number;
    confidence: number;
    priceRecommendation?: number;
  }>;
  isOverridden: boolean;
}

const AIManagement = () => {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(null);
  const [overrideData, setOverrideData] = useState({
    reason: '',
    forecasts: [] as any[],
  });

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    try {
      // This would fetch from AI service
      const response = await api.get('http://localhost:8000/api/v1/forecasts/nationwide');
      // In a real app, you'd have an endpoint to get all forecasts
      // For now, we'll use mock data
      setForecasts([
        {
          _id: '1',
          forecastDate: new Date().toISOString(),
          forecastType: 'monthly',
          scope: 'nationwide',
          forecasts: [
            { crop: 'Maize', demand: 85, confidence: 92, priceRecommendation: 45 },
            { crop: 'Beans', demand: 78, confidence: 88, priceRecommendation: 120 },
          ],
          isOverridden: false,
        },
      ]);
    } catch (error: any) {
      console.error('Failed to load forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async (forecastId: string) => {
    try {
      await api.put(`http://localhost:8000/api/v1/admin/forecasts/${forecastId}/override`, {
        admin_id: 'admin-id', // Would come from auth
        reason: overrideData.reason,
        forecasts: overrideData.forecasts,
        changes: [],
      });
      toast.success('Forecast overridden successfully');
      setSelectedForecast(null);
      fetchForecasts();
    } catch (error: any) {
      toast.error('Failed to override forecast');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading AI forecasts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Forecast Management</h1>

      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Admin Override:</strong> You can override AI forecasts if you have better
          information or need to adjust predictions. All overrides are logged for audit purposes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Forecasts List */}
        <div className="lg:col-span-2 space-y-4">
          {forecasts.map((forecast) => (
            <div
              key={forecast._id}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition"
              onClick={() => {
                setSelectedForecast(forecast);
                setOverrideData({
                  reason: '',
                  forecasts: forecast.forecasts,
                });
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {forecast.forecastType.toUpperCase()} Forecast
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(forecast.forecastDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Scope: {forecast.scope}</p>
                </div>
                {forecast.isOverridden && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                    OVERRIDDEN
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {forecast.forecasts.map((f, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">{f.crop}</span>
                    <span className="font-semibold text-gray-900">
                      {f.demand}% (Confidence: {f.confidence}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Override Panel */}
        {selectedForecast && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Override Forecast</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Override
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={overrideData.reason}
                    onChange={(e) =>
                      setOverrideData({ ...overrideData, reason: e.target.value })
                    }
                    placeholder="Explain why you're overriding this forecast..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjusted Forecasts
                  </label>
                  <div className="space-y-2">
                    {overrideData.forecasts.map((f, index) => (
                      <div key={index} className="border rounded p-2">
                        <div className="font-semibold text-sm">{f.crop}</div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>Demand:</span>
                          <input
                            type="number"
                            className="w-20 px-2 py-1 border rounded"
                            value={f.demand}
                            onChange={(e) => {
                              const newForecasts = [...overrideData.forecasts];
                              newForecasts[index].demand = parseFloat(e.target.value) || 0;
                              setOverrideData({ ...overrideData, forecasts: newForecasts });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleOverride(selectedForecast._id)}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Override Forecast
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIManagement;

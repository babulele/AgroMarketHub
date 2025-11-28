# AgroMarketHub AI Service

FastAPI service for AI demand forecasting.

## Setup

1. Install base dependencies (required):
```bash
pip install -r requirements.txt
```

**Note:** The base requirements do NOT include TensorFlow or Prophet (large ML packages). 
The current implementation uses simplified forecasting with numpy/pandas/scikit-learn.

2. (Optional) Install ML dependencies for future LSTM/Prophet models:
```bash
# If you encounter timeout errors, increase timeout:
pip install --default-timeout=1000 -r requirements-ml.txt
```

3. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

4. Run the service:
```bash
uvicorn main:app --reload --port 8000
```

Or directly:
```bash
python main.py
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/v1/forecasts/nationwide` - Nationwide demand forecast
- `GET /api/v1/forecasts/regional` - Regional forecast
- `GET /api/v1/forecasts/heatmap` - Demand heatmap
- `GET /api/v1/forecasts/price-recommendation/{product_id}` - Price recommendations
- `GET /api/v1/forecasts/farmer-insights/{farmer_id}` - Farmer insights
- `PUT /api/v1/admin/forecasts/{forecast_id}/override` - Override forecast
- `GET /api/v1/admin/audit-logs` - Get audit logs


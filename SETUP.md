# AgroMarketHub Setup Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Python >= 3.9
- MongoDB (local or Atlas)
- Redis (for caching)

## Initial Setup

### 1. Install All Dependencies

Run this command from the root directory to install all Node.js dependencies:

```bash
npm run install:all
```

This will install dependencies for:
- Root workspace
- Frontend
- Backend

### 2. Install AI Service Dependencies

The AI service uses Python, so install its dependencies separately:

```bash
npm run install:ai
```

Or manually:
```bash
cd ai-service
pip install -r requirements.txt
```

**Note:** The base requirements exclude TensorFlow and Prophet (large ML packages ~300MB+) 
to avoid download timeouts. The current implementation works with the base requirements.

If you need ML models later, install them separately:
```bash
cd ai-service
pip install --default-timeout=1000 -r requirements-ml.txt
```

Create `backend/.env` from `backend/.env.example` and configure:
- MongoDB connection string
- JWT secret
- Redis connection
- M-Pesa API credentials
- Email service credentials (SMTP)
- Cloudinary credentials (for image uploads - optional, uses local storage if not configured)

### 3. AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt
```

Create `ai-service/.env` from `ai-service/.env.example` and configure:
- MongoDB connection string
- Redis connection
- Weather API key

### 4. Frontend Setup

Frontend dependencies are installed automatically with `npm run install:all`. If you need to install separately:

```bash
cd frontend
npm install
```

Create `frontend/.env` from `frontend/.env.example` and configure:
- API URL
- AI Service URL

## Running the Application

### Development Mode

From the root directory, run all services:

```bash
npm run dev:all
```

Or run individually:

```bash
# Backend (port 5000)
npm run dev:backend

# Frontend (port 3000)
npm run dev:frontend

# AI Service (port 8000)
npm run dev:ai

# Or from ai-service directory:
cd ai-service
npm run dev
```

## Project Structure

```
AgroMarketHub/
├── backend/          # Express.js API
│   ├── src/
│   │   ├── models/   # MongoDB schemas
│   │   ├── routes/   # API routes
│   │   ├── controllers/
│   │   ├── services/ # M-Pesa, Email services
│   │   └── middleware/
├── frontend/         # React.js app
│   └── src/
│       ├── pages/    # Page components
│       ├── components/
│       ├── store/     # Zustand stores
│       └── services/  # API clients
└── ai-service/       # FastAPI service
    ├── routers/      # API endpoints
    ├── services/     # ML models & forecasting
    └── utils/
```

## Key Features Implemented

### Backend
- ✅ User authentication & authorization (JWT)
- ✅ User management (Farmers, Buyers, Riders, Admins)
- ✅ Product management with inventory
- ✅ Order management
- ✅ M-Pesa payment integration
- ✅ Subscription management
- ✅ Delivery & logistics
- ✅ Email notifications
- ✅ Admin APIs (verification, disputes, analytics)

### AI Service
- ✅ FastAPI service setup
- ✅ Data collection (weather, sales, buyer behavior)
- ✅ Forecasting APIs (demand, price recommendations)
- ✅ Regional heatmaps
- ✅ Admin override system with audit logging

### Frontend
- ✅ React.js with TypeScript
- ✅ Authentication (Login/Register)
- ✅ Protected routes with role-based access
- ✅ Farmer portal (basic structure)
- ✅ Buyer marketplace (product listing)
- ✅ Rider dashboard (structure)
- ✅ Admin dashboard (structure)
- ✅ TailwindCSS styling
- ✅ Zustand state management

## Next Steps

1. ✅ Complete remaining frontend pages (Product Detail, Cart, Checkout, etc.)
2. ✅ Implement AI dashboard visualizations
3. ✅ Add image upload functionality (Cloudinary)
4. Complete admin dashboard features
5. Add comprehensive error handling
6. Implement ML model training scripts
7. Add unit and integration tests
8. Set up CI/CD pipeline

## API Endpoints

### Backend (http://localhost:5000/api/v1)
- `/auth/login` - User login
- `/auth/register` - User registration
- `/products` - Product CRUD
- `/orders` - Order management
- `/users` - User management
- `/subscriptions` - Subscription management
- `/deliveries` - Delivery management
- `/mpesa/payment` - M-Pesa payment
- `/admin/*` - Admin endpoints

### AI Service (http://localhost:8000/api/v1)
- `/forecasts/nationwide` - Nationwide demand forecast
- `/forecasts/regional` - Regional forecast
- `/forecasts/heatmap` - Demand heatmap
- `/forecasts/price-recommendation/{product_id}` - Price recommendations
- `/forecasts/farmer-insights/{farmer_id}` - Farmer insights
- `/admin/forecasts/{id}/override` - Override forecast

## Environment Variables

See `.env.example` files in each service directory for required environment variables.


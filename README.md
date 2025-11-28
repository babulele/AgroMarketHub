# AgroMarketHub

A Kenyan marketplace connecting farmers directly to consumers, powered by advanced AI demand forecasting to help farmers plan crops, optimize pricing, and increase income.

## Project Structure

This is a monorepo containing three main services:

- `frontend/` - React.js application with TailwindCSS
- `backend/` - Express.js API server
- `ai-service/` - FastAPI service for demand forecasting

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Python >= 3.9
- MongoDB (local or Atlas)
- Redis (for caching)

## Setup Instructions

### 1. Install Dependencies

```bash
npm run install:all
```

Or install individually:
```bash
npm install
npm install --workspace=frontend
npm install --workspace=backend
npm install --workspace=ai-service
```

### 2. Environment Configuration

Copy the example environment files and configure them:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env

# AI Service
cp ai-service/.env.example ai-service/.env
```

Fill in the required environment variables in each `.env` file.

### 3. Run Development Servers

Run all services concurrently:
```bash
npm run dev:all
```

Or run individually:
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# AI Service only
npm run dev:ai

# Or from ai-service directory:
cd ai-service
npm run dev
```

## Tech Stack

### Frontend
- React.js
- TailwindCSS
- Zustand (state management)
- React Router
- Axios

### Backend
- Node.js with Express.js
- TypeScript
- MongoDB with Mongoose
- Redis
- JWT Authentication
- Cloudinary (image storage)

### AI Service
- FastAPI (Python)
- LSTM & Prophet for forecasting
- Random Forest for price prediction
- K-means clustering

## Features

- **Farmer Portal**: Product listing, inventory management, AI insights, instant payouts
- **Buyer Portal**: Browse marketplace, order with M-Pesa, track deliveries
- **Rider Portal**: Delivery management and status updates
- **Admin Dashboard**: Verification, moderation, big data analytics, AI management
- **AI Forecasting**: Demand predictions, heatmaps, price recommendations

## License

Private - All rights reserved


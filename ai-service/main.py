from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from routers import forecasts, admin, reports
from utils.database import connect_db, close_db
from utils.redis_client import get_redis_client, close_redis

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    await get_redis_client()
    yield
    # Shutdown
    await close_db()
    await close_redis()

app = FastAPI(
    title="AgroMarketHub AI Service",
    description="AI Demand Forecasting Service for AgroMarketHub",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai-service"}

# Include routers
app.include_router(forecasts.router, prefix="/api/v1/forecasts", tags=["forecasts"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


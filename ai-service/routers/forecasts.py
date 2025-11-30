from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Dict
from services.forecast_service import ForecastService
from utils.database import get_database
from datetime import datetime
from models.forecast import ForecastResponse

router = APIRouter()
forecast_service = ForecastService()

@router.get("/nationwide", response_model=ForecastResponse)
async def get_nationwide_forecast(
    forecast_type: str = Query("monthly", regex="^(daily|weekly|monthly|seasonal)$")
):
    """Get nationwide demand forecast"""
    try:
        forecasts = await forecast_service.generate_demand_forecast(
            forecast_type=forecast_type,
            scope="nationwide"
        )
        
        return {
            "success": True,
            "data": {
                "forecastDate": datetime.now(),
                "forecastType": forecast_type,
                "scope": "nationwide",
                "forecasts": forecasts
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/regional", response_model=Dict)
async def get_regional_forecast(
    county: Optional[str] = None,
    subCounty: Optional[str] = None
):
    """Get regional demand forecast"""
    try:
        region = {}
        if county:
            region["county"] = county
        if subCounty:
            region["subCounty"] = subCounty
        
        forecasts = await forecast_service.generate_demand_forecast(
            scope="county" if county else "nationwide",
            region=region if region else None
        )
        
        return {
            "success": True,
            "data": {
                "forecastDate": datetime.now(),
                "region": region,
                "forecasts": forecasts
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/heatmap")
async def get_demand_heatmap():
    """Get regional demand heatmap data"""
    try:
        heatmap_data = await forecast_service.generate_regional_heatmap()
        return {
            "success": True,
            "data": heatmap_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/price-recommendation/{product_id}")
async def get_price_recommendation(product_id: str):
    """Get price recommendation for a product"""
    try:
        recommendation = await forecast_service.generate_price_recommendations(product_id)
        return {
            "success": True,
            "data": recommendation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/farmer-insights/{farmer_id}")
async def get_farmer_insights(farmer_id: str):
    """Get farmer-specific insights and recommendations"""
    try:
        insights = await forecast_service.get_farmer_insights(farmer_id)
        return {
            "success": True,
            "data": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/yield-vs-demand")
async def get_yield_vs_demand_analysis(
    product_id: Optional[str] = None,
    category: Optional[str] = None,
    county: Optional[str] = None,
    days: int = 90
):
    """Analyze yield vs market demand for products"""
    try:
        analysis = await forecast_service.analyze_yield_vs_demand(
            product_id=product_id,
            category=category,
            county=county,
            days=days
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


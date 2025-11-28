from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class ForecastData(BaseModel):
    crop: str
    demand: float
    confidence: float
    priceRecommendation: Optional[float] = None
    region: Optional[str] = None

class ForecastResponse(BaseModel):
    success: bool
    data: Dict

class ForecastOverride(BaseModel):
    admin_id: str
    reason: str
    forecasts: List[ForecastData]
    changes: List[Dict]


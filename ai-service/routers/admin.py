from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Optional
from utils.database import get_database
from datetime import datetime
from models.forecast import ForecastOverride

router = APIRouter()

@router.put("/forecasts/{forecast_id}/override")
async def override_forecast(forecast_id: str, override_data: ForecastOverride):
    """Override AI forecast with admin adjustments"""
    try:
        db = get_database()
        
        # Update forecast
        update_data = {
            "isOverridden": True,
            "overrideBy": override_data.admin_id,
            "overrideAt": datetime.now(),
            "overrideReason": override_data.reason,
            "forecasts": override_data.forecasts
        }
        
        result = await db.aiforecasts.update_one(
            {"_id": forecast_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Forecast not found")
        
        # Create audit log
        await db.auditlogs.insert_one({
            "action": "ai_forecast_override",
            "performedBy": override_data.admin_id,
            "targetType": "forecast",
            "targetId": forecast_id,
            "changes": override_data.changes,
            "reason": override_data.reason,
            "createdAt": datetime.now()
        })
        
        return {
            "success": True,
            "message": "Forecast overridden successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/audit-logs")
async def get_audit_logs(
    action: Optional[str] = None,
    limit: int = 50
):
    """Get audit logs for AI forecast changes"""
    try:
        db = get_database()
        
        query = {}
        if action:
            query["action"] = action
        
        logs = await db.auditlogs.find(query)\
            .sort("createdAt", -1)\
            .limit(limit)\
            .to_list(length=limit)
        
        return {
            "success": True,
            "data": logs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


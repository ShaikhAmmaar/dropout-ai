from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import RiskPrediction
from typing import List
import numpy as np

router = APIRouter()

@router.get("/risk-history")
async def get_risk_history(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        query = select(RiskPrediction).where(RiskPrediction.student_id == student_id).order_by(RiskPrediction.created_at.desc()).limit(30)
        result = await db.execute(query)
        predictions = result.scalars().all()
        
        history_list = [
            {
                "id": p.id,
                "probability": p.dropout_probability,
                "risk_level": p.risk_level,
                "timestamp": p.created_at
            } for p in predictions
        ]
        
        # Calculate trend direction
        trend = "STABLE"
        if len(history_list) >= 2:
            probs = [p["probability"] for p in history_list][::-1] # Chronological
            x = np.arange(len(probs))
            slope = np.polyfit(x, probs, 1)[0]
            if slope > 0.05: trend = "INCREASING_RISK"
            elif slope < -0.05: trend = "DECREASING_RISK"
            
        return {
            "student_id": student_id,
            "history": history_list,
            "trend_direction": trend
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
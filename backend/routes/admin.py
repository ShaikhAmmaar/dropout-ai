from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from db.database import get_db
from db import models
from core.dependencies import get_current_admin

router = APIRouter()

@router.get("/analytics")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    # Count students
    result_s = await db.execute(select(func.count(models.Student.id)))
    total_students = result_s.scalar()
    
    # Count critical risks
    result_r = await db.execute(select(func.count(models.RiskPrediction.id)).filter(models.RiskPrediction.risk_level == "Critical"))
    critical_cases = result_r.scalar()
    
    # Count crisis alerts
    result_c = await db.execute(select(func.count(models.MentalHealthLog.id)).filter(models.MentalHealthLog.crisis_flag == True))
    crisis_count = result_c.scalar()
    
    return {
        "total_students": total_students,
        "critical_risk_cases": critical_cases,
        "crisis_alerts_today": crisis_count,
        "system_health": "Optimal"
    }
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from db import models, schemas
from core.dependencies import get_current_user
from services.risk_engine import risk_engine

router = APIRouter()

@router.post("/predict/{student_id}", response_model=schemas.RiskPredictionResponse)
async def predict_risk(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Fetch student
    from sqlalchemy.future import select
    result = await db.execute(select(models.Student).filter(models.Student.id == student_id))
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_data = {
        "name": student.name,
        "attendance_rate": student.attendance_rate,
        "gpa": student.gpa,
        "financial_stress_score": student.financial_stress_score,
        "family_support_score": student.family_support_score
    }

    assessment = await risk_engine.assess_student(student_data)
    
    # Save prediction history
    new_pred = models.RiskPrediction(
        student_id=student_id,
        risk_score=assessment['risk_score'],
        risk_level=assessment['risk_level'],
        shap_values=assessment['shap_values']
    )
    db.add(new_pred)
    
    # Audit log
    audit = models.AuditLog(user_id=current_user.id, action=f"Risk prediction for student {student_id}")
    db.add(audit)
    
    await db.commit()
    return assessment
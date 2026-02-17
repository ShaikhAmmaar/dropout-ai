from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from db import models, schemas
from core.dependencies import get_current_user
from services.gemini_service import gemini_service
from services.alert_service import alert_service

router = APIRouter()

@router.post("/log/{student_id}", response_model=schemas.MentalHealthLogResponse)
async def log_mental_health(
    student_id: str,
    log_in: schemas.MentalHealthLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. AI Analysis
    analysis = await gemini_service.analyze_log(log_in.text_entry)
    
    # 2. Persist
    new_log = models.MentalHealthLog(
        student_id=student_id,
        text_entry=log_in.text_entry,
        sentiment_score=analysis['sentiment_score'],
        crisis_flag=analysis['crisis_flag']
    )
    db.add(new_log)
    
    # 3. Emergency Alert
    if analysis['crisis_flag']:
        # In a real app we'd fetch the student name
        alert_service.trigger_crisis_alert("Student " + student_id)
    
    await db.commit()
    await db.refresh(new_log)
    return new_log
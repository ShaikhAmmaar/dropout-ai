from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from ml.predict import predict_student_risk
import uuid
from datetime import datetime

router = APIRouter()

class RiskInput(BaseModel):
    student_id: str
    gpa: float
    attendance_percentage: float
    assignment_completion_rate: float
    backlogs: int

@router.post("/predict-risk")
async def predict_risk(data: RiskInput):
    try:
        prob = predict_student_risk(
            data.gpa, 
            data.attendance_percentage, 
            data.assignment_completion_rate, 
            data.backlogs
        )
        
        risk_level = "LOW"
        if prob > 0.6: risk_level = "HIGH"
        elif prob > 0.3: risk_level = "MEDIUM"
        
        # Simple SHAP mock for demo
        shap = {
            "Attendance": (90 - data.attendance_percentage) * 0.2,
            "GPA": (3.5 - data.gpa) * 15,
            "Backlogs": data.backlogs * 12
        }
        
        return {
            "dropout_probability": round(prob, 4),
            "risk_level": risk_level,
            "shap_explanation": shap,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
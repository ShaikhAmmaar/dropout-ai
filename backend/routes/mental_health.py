from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.gemini_client import analyze_journal_with_gemini

router = APIRouter()

class JournalInput(BaseModel):
    student_id: str
    text: str

@router.post("/analyze-mental-health")
async def analyze_mental_health(data: JournalInput):
    try:
        analysis = await analyze_journal_with_gemini(data.text)
        return {
            "student_id": data.student_id,
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
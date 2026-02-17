from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class RiskInput(BaseModel):
    student_id: str
    gpa: float
    attendance_percentage: float
    assignment_completion_rate: float
    backlogs: int

class JournalInput(BaseModel):
    student_id: str
    text: str

class RiskHistoryResponse(BaseModel):
    student_id: str
    history: List[Dict]
    trend_direction: str
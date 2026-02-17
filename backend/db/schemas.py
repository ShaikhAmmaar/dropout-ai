from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: Optional[str] = "student"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class StudentBase(BaseModel):
    name: str
    age: Optional[int] = None
    attendance_rate: float
    gpa: float
    financial_stress_score: float
    family_support_score: float

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class RiskPredictionResponse(BaseModel):
    risk_score: float
    risk_level: str
    shap_values: Dict[str, float]
    alert_triggered: bool

class MentalHealthLogCreate(BaseModel):
    text_entry: str

class MentalHealthLogResponse(BaseModel):
    sentiment_score: float
    crisis_flag: bool
    created_at: datetime
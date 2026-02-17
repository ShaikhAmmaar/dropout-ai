from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid
from datetime import datetime

class Student(Base):
    __tablename__ = "students"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    name = Column(String)
    institution_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"))
    dropout_probability = Column(Float)
    risk_level = Column(String)
    shap_explanation = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class MentalHealthLog(Base):
    __tablename__ = "mental_health_logs"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"))
    text_input = Column(String)
    emotional_score = Column(Float)
    crisis_flag = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
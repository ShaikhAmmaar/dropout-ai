import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student") # student, admin, counselor
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Student(Base):
    __tablename__ = "students"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    age = Column(Integer)
    attendance_rate = Column(Float, default=100.0)
    gpa = Column(Float, default=4.0)
    financial_stress_score = Column(Float, default=0.0) # 0-1
    family_support_score = Column(Float, default=1.0) # 0-1
    created_at = Column(DateTime, default=datetime.utcnow)

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    risk_score = Column(Float) # 0-1
    risk_level = Column(String) # Low, Medium, High, Critical
    shap_values = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

class MentalHealthLog(Base):
    __tablename__ = "mental_health_logs"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    text_entry = Column(String, nullable=False)
    sentiment_score = Column(Float)
    crisis_flag = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
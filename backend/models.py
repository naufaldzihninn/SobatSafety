from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from .database import Base

class Area(Base):
    __tablename__ = "areas"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    required_ppe = Column(Text, nullable=True) # JSON array as string
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DetectionLog(Base):
    __tablename__ = "detection_logs"

    id = Column(String, primary_key=True, index=True)
    area_id = Column(String, ForeignKey("areas.id"))
    image_path = Column(String, nullable=True)
    total_persons = Column(Integer, default=0)
    compliant_count = Column(Integer, default=0)
    violation_count = Column(Integer, default=0)
    violation_details = Column(Text, nullable=True) # JSON details
    confidence_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Violation(Base):
    __tablename__ = "violations"

    id = Column(String, primary_key=True, index=True)
    detection_log_id = Column(String, ForeignKey("detection_logs.id"))
    missing_ppe = Column(String, nullable=True)
    is_acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    name = Column(String)
    role = Column(String, default="supervisor") # admin, supervisor
    created_at = Column(DateTime(timezone=True), server_default=func.now())

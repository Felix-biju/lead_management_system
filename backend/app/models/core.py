from sqlalchemy import Column, String, Integer, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True)
    role = Column(Enum("Agent", "TL", "Manager", "Admin", name="user_roles"), default="Agent")
    
    # Relationship to leads
    leads = relationship("Lead", back_populates="owner")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    source = Column(String(50), default="Manual Entry")
    
    # State Machine Pipeline
    stage = Column(Enum("New", "Contacted", "Interested", "Negotiating", "Closed", name="lead_stages"), default="New")
    
    # Ownership
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship back to the user
    owner = relationship("User", back_populates="leads")
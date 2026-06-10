import uuid
import datetime
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

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
    

   # State Machine Pipeline (Updated with Won/Lost)
    stage = Column(Enum("New", "Contacted", "Interested", "Negotiating", "Closed Won", "Closed Lost", name="lead_stages"), default="New")
    
    # Ownership
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    # Relationship back to the user
    owner = relationship("User", back_populates="leads")
    # (Inside the Lead class)
    # NEW: The connection to the notes table
    notes = relationship("Note", back_populates="lead", cascade="all, delete-orphan")

    # --- NEW: NOTES TABLE ---
class Note(Base):
    __tablename__ = "notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lead_id = Column(String(36), ForeignKey("leads.id"), nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), default="Agent")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # The connection back to the lead
    lead = relationship("Lead", back_populates="notes")
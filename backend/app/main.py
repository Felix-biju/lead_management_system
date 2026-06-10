from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import engine, Base, get_db
from app.models import core
from app.schemas.lead import LeadCreate, LeadResponse, LeadStageUpdate, LeadOwnerUpdate
from app.schemas.user import UserCreate, UserResponse
from app.schemas.note import NoteCreate, NoteResponse

# Build the DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lead Management System API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "success", "message": "Backend and Frontend are officially connected!"}

@app.post("/api/leads", response_model=LeadResponse)
def create_new_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    new_lead = core.Lead(
        first_name=lead.first_name,
        last_name=lead.last_name,
        email=lead.email,
        phone=lead.phone,
        source=lead.source
    )
    try:
        db.add(new_lead)
        db.commit()
        db.refresh(new_lead)
        return new_lead
    except IntegrityError:
        db.rollback() 
        raise HTTPException(status_code=400, detail="A lead with this email or phone already exists.")

@app.get("/api/leads", response_model=List[LeadResponse])
def get_all_leads(db: Session = Depends(get_db)):
    return db.query(core.Lead).order_by(core.Lead.created_at.desc()).all()

@app.put("/api/leads/{lead_id}/stage")
def update_lead_stage(lead_id: str, stage_data: LeadStageUpdate, db: Session = Depends(get_db)):
    lead = db.query(core.Lead).filter(core.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.stage = stage_data.stage
    db.commit()
    db.refresh(lead)
    return {"message": "Stage updated successfully", "new_stage": lead.stage}

@app.post("/api/users", response_model=UserResponse)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = core.User(name=user.name, email=user.email, role=user.role)
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except IntegrityError:
        db.rollback() 
        raise HTTPException(status_code=400, detail="A user with this email already exists.")

@app.get("/api/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(core.User).all()

@app.put("/api/leads/{lead_id}/owner")
def update_lead_owner(lead_id: str, owner_data: LeadOwnerUpdate, db: Session = Depends(get_db)):
    lead = db.query(core.Lead).filter(core.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.owner_id = owner_data.owner_id
    db.commit()
    db.refresh(lead)
    return {"message": "Agent assigned successfully", "owner_id": lead.owner_id}

# --- THE NEW NOTES ENDPOINTS ---
@app.post("/api/leads/{lead_id}/notes", response_model=NoteResponse)
def add_lead_note(lead_id: str, note: NoteCreate, db: Session = Depends(get_db)):
    lead = db.query(core.Lead).filter(core.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    new_note = core.Note(lead_id=lead_id, content=note.content, author=note.author)
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

@app.get("/api/leads/{lead_id}/notes", response_model=List[NoteResponse])
def get_lead_notes(lead_id: str, db: Session = Depends(get_db)):
    notes = db.query(core.Note).filter(core.Note.lead_id == lead_id).order_by(core.Note.created_at.desc()).all()
    return notes
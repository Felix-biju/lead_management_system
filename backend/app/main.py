from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

# Here is the 'Base' that went missing!
from app.database import engine, Base, get_db
from app.models import core
from app.schemas.lead import LeadCreate, LeadResponse, LeadStageUpdate

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

@app.get("/api/leads")
def get_all_leads(db: Session = Depends(get_db)):
    leads = db.query(core.Lead).order_by(core.Lead.created_at.desc()).all()
    return leads

@app.put("/api/leads/{lead_id}/stage")
def update_lead_stage(lead_id: str, stage_data: LeadStageUpdate, db: Session = Depends(get_db)):
    lead = db.query(core.Lead).filter(core.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    lead.stage = stage_data.stage
    db.commit()
    db.refresh(lead)
    
    return {"message": "Stage updated successfully", "new_stage": lead.stage}
from jose import jwt, JWTError
from datetime import datetime, timedelta

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

from passlib.context import CryptContext
from pydantic import BaseModel



# IMPORTANT: Import your models using your specific folder structure
from .models import core as models 

# --- SECURITY CONFIGURATION ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- PYDANTIC SCHEMAS FOR AUTH ---
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "Agent"

class UserLogin(BaseModel):
    email: str
    password: str

class UserRoleUpdate(BaseModel):
    role: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# --- PASSWORD RESET CONFIGURATION ---
SECRET_KEY = "your-super-secret-lms-key-change-in-production"
ALGORITHM = "HS256"

@app.post("/api/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    
    # SECURITY BEST PRACTICE: Even if the email doesn't exist, we say the same thing
    # so hackers can't use this form to guess which emails are registered!
    if not user:
        return {"message": "If that email is registered, a reset token has been generated."}
    
    # Generate a secure JWT token valid for 15 minutes
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode = {"sub": user.email, "exp": expire}
    reset_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    # SIMULATE SENDING AN EMAIL (Prints to your VS Code Terminal)
    print("\n" + "="*60)
    print(f"📧 EMAIL SIMULATION TO: {user.email}")
    print(f"Subject: Reset Your LMS Pro Password")
    print(f"Your secure reset token is: {reset_token}")
    print("="*60 + "\n")
    
    return {"message": "If that email is registered, a reset token has been generated."}

@app.post("/api/auth/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        # Decode the token to see who it belongs to and if it has expired
        payload = jwt.decode(req.token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=400, detail="Invalid token structure")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Hash the new password and save it
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

# --- AUTHENTICATION ROUTES ---
@app.post("/api/auth/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Securely hash the password before saving to the database
    hashed_password = get_password_hash(user.password)
    
    new_user = models.User(
        name=user.name, 
        email=user.email, 
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User created successfully", "role": new_user.role}

@app.post("/api/auth/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    # Verify user exists and the cryptographic hash matches
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role
    }

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

@app.put("/api/users/{user_id}/role")
def update_user_role(user_id: str, role_data: UserRoleUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role_data.role
    db.commit()
    return {"message": "Role updated successfully", "new_role": user.role}

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
from pydantic import BaseModel
from typing import Optional

class LeadCreate(BaseModel):
    first_name: str
    last_name: str
    email: str 
    phone: str
    source: Optional[str] = "Web Form"

class LeadResponse(LeadCreate):
    id: str
    stage: str
    owner_id: Optional[str] = None # <-- NEW: Allows React to see who owns it

    class Config:
        from_attributes = True

class LeadStageUpdate(BaseModel):
    stage: str

# --- NEW: Schema for assigning agents ---
class LeadOwnerUpdate(BaseModel):
    owner_id: str
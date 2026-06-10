from pydantic import BaseModel
from typing import Optional

# We swap EmailStr for a standard str to avoid extra library dependencies
class LeadCreate(BaseModel):
    first_name: str
    last_name: str
    email: str 
    phone: str
    source: Optional[str] = "Web Form"

class LeadResponse(LeadCreate):
    id: str

    class Config:
        from_attributes = True

# Add this to the bottom of lead.py
class LeadStageUpdate(BaseModel):
    stage: str
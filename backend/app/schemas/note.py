from pydantic import BaseModel
from datetime import datetime

class NoteCreate(BaseModel):
    content: str
    author: str = "Agent"

class NoteResponse(NoteCreate):
    id: str
    lead_id: str
    created_at: datetime

    class Config:
        from_attributes = True
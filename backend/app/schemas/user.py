from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    role: str = "Agent"

class UserResponse(UserCreate):
    id: str

    class Config:
        from_attributes = True
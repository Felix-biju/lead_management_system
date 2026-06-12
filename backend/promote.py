from app.database import SessionLocal
from app.models.core import User

def promote_user(email: str, new_role: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        user.role = new_role
        db.commit()
        print(f"✅ Success! {user.name} is now an {new_role}.")
    else:
        print(f"❌ User with email {email} not found.")
    
    db.close()

# Replace with the EXACT email you just registered with!
promote_user("felixxbiju@gmail.com", "Admin")
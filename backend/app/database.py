from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# MySQL Connection String format: mysql+pymysql://<username>:<password>@<host>:<port>/<db_name>
# We will use standard local defaults for now.
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:1234@localhost:3306/lms_db" 

# Create the SQLAlchemy engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our database models
Base = declarative_base()

# Dependency hook for our FastAPI routes to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
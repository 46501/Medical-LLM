import os
from app.core.database import Base, engine
from app.models.user import User
from app.models.document import Document

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables created successfully.")

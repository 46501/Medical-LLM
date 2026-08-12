import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import os
import sys
# Make sure backend is in the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set a mock database URL before importing the app
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET"] = "supersecretkey"
os.environ["OPENAI_API_KEY"] = "testkey"

from main import app
from app.core.database import Base, get_db

# Setup SQLite in-memory database
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override pgvector Vector type compilation for SQLite so tests don't crash
from sqlalchemy.ext.compiler import compiles
from pgvector.sqlalchemy import Vector

@compiles(Vector, "sqlite")
def compile_vector(type_, compiler, **kw):
    # For SQLite tests, we'll just mock the vector as a String or BLOB
    return "TEXT"

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

from app.core.rate_limit import limiter
limiter.enabled = False

from app.llm.provider import LLMProvider
class MockLLMProvider(LLMProvider):
    async def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        return "This is a mock Gemini response."
    async def generate_stream(self, system_prompt: str, user_prompt: str):
        yield "This "
        yield "is a "
        yield "mock Gemini stream."
    async def extract_text_from_file(self, file_bytes: bytes, mime_type: str) -> str:
        return "Mock extracted text from file."

def override_get_llm():
    return MockLLMProvider()

from app.api.deps import get_llm
app.dependency_overrides[get_llm] = override_get_llm

@pytest.fixture(scope="session")
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(setup_db):
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        # Rollback any uncommitted changes
        db.rollback()
        db.close()

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

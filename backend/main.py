from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MediMind AI API",
    description="Backend API for MediMind AI Medical Assistant",
    version="1.0.0"
)

from app.api.api import api_router
from app.core.errors import add_exception_handlers

from app.core.rate_limit import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

# Configure CORS securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

add_exception_handlers(app)
app.include_router(api_router)

from starlette.middleware.base import BaseHTTPMiddleware
from app.core.middleware import request_logger_middleware
from sqlalchemy import text
from fastapi.responses import JSONResponse
from fastapi import Depends
from sqlalchemy.orm import Session
from app.api import deps

app.add_middleware(BaseHTTPMiddleware, dispatch=request_logger_middleware)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/ready")
def ready_check(db: Session = Depends(deps.get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception as e:
        return JSONResponse(status_code=503, content={"status": "not_ready", "error": str(e)})


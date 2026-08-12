import uuid
import time
import structlog
from fastapi import Request

logger = structlog.get_logger("medimind")

async def request_logger_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    
    # Do not log sensitive paths like /auth/login passwords
    if request.url.path != "/health":
        logger.info(
            "request_handled",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(process_time, 2),
            request_id=request_id
        )
    
    response.headers["X-Request-ID"] = request_id
    return response

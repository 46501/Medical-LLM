from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.chat import ChatRequest, ChatResponse
from app.llm.provider import get_llm_provider, LLMProvider
from app.safety.classifier import MedicalSafetyEngine

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    current_user = Depends(deps.get_current_user),
    llm: LLMProvider = Depends(deps.get_llm),
):
    safety_engine = MedicalSafetyEngine(llm)
    
    # 1. Safety Check
    is_safe, fallback_msg = await safety_engine.is_safe(request.message)
    if not is_safe:
        return ChatResponse(response=fallback_msg, is_safe=False)
        
    # 2. LLM Generation
    system_prompt = (
        "You are MediMind AI, a helpful medical assistant. "
        "You must NEVER claim to be a doctor or give a definitive diagnosis. "
        "You must NEVER recommend, prescribe, or endorse dangerous medications. "
        "Provide educational information, highlight warning signs, and encourage professional consultation."
    )
    try:
        raw_response = await llm.generate_response(system_prompt, request.message)
        # 3. Response Validation
        safe_response = await safety_engine.validate_response(raw_response)
        return ChatResponse(response=safe_response, is_safe=True)
    except Exception as e:
        return ChatResponse(response="Service temporarily unavailable. Please try again later.", is_safe=False)

from fastapi.responses import StreamingResponse

@router.post("/stream")
async def chat_stream_endpoint(
    request: ChatRequest,
    current_user = Depends(deps.get_current_user),
    llm: LLMProvider = Depends(deps.get_llm),
):
    safety_engine = MedicalSafetyEngine(llm)
    
    # 1. Safety Check (Input only)
    is_safe, fallback_msg = await safety_engine.is_safe(request.message)
    if not is_safe:
        async def fallback_generator():
            yield fallback_msg
        return StreamingResponse(fallback_generator(), media_type="text/event-stream")
        
    system_prompt = (
        "You are MediMind AI, a helpful medical assistant. "
        "You must NEVER claim to be a doctor or give a definitive diagnosis. "
        "You must NEVER recommend, prescribe, or endorse dangerous medications. "
        "Provide educational information, highlight warning signs, and encourage professional consultation."
    )
    
    # 2. LLM Streaming with error handling
    async def safe_stream():
        try:
            async for chunk in llm.generate_stream(system_prompt, request.message):
                yield chunk
        except Exception as e:
            yield "\n\nService temporarily unavailable. Please try again later."
    
    return StreamingResponse(
        safe_stream(),
        media_type="text/event-stream"
    )

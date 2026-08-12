from app.llm.provider import get_llm_provider
from app.safety.classifier import MedicalSafetyEngine

async def analyze_medical_report(text: str) -> str:
    llm = get_llm_provider()
    engine = MedicalSafetyEngine(llm)
    
    prompt = f"""
    You are an AI assistant analyzing a medical report. 
    Report content: {text}
    
    Identify:
    - Test name
    - Any abnormal values
    - General explanation
    """
    
    raw = await llm.generate_response(prompt, text)
    safe = await engine.validate_response(raw)
    return safe

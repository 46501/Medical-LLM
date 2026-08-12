from app.llm.provider import LLMProvider
from app.safety.classifier import MedicalSafetyEngine

async def analyze_medical_report(text: str, llm: LLMProvider) -> str:
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

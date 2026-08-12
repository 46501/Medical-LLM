import pytest
from app.safety.classifier import MedicalSafetyEngine
from app.llm.provider import GeminiProvider

@pytest.mark.asyncio
async def test_safety_engine_normal_query():
    engine = MedicalSafetyEngine(GeminiProvider(api_key="mock"))
    is_safe, msg = await engine.is_safe("What is anemia?")
    assert is_safe == True
    assert msg == ""

@pytest.mark.asyncio
async def test_safety_engine_emergency():
    engine = MedicalSafetyEngine(GeminiProvider(api_key="mock"))
    is_safe, msg = await engine.is_safe("I am having a heart attack right now.")
    assert is_safe == False
    assert "emergency" in msg.lower()

@pytest.mark.asyncio
async def test_safety_engine_self_harm():
    engine = MedicalSafetyEngine(GeminiProvider(api_key="mock"))
    is_safe, msg = await engine.is_safe("I want to kill myself.")
    assert is_safe == False
    assert "emergency" in msg.lower()

@pytest.mark.asyncio
async def test_safety_engine_response_validation():
    engine = MedicalSafetyEngine(GeminiProvider(api_key="mock"))
    safe_response = await engine.validate_response("You have a cold.")
    assert "Important:" in safe_response

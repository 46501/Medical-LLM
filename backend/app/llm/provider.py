from abc import ABC, abstractmethod
from typing import AsyncGenerator
from tenacity import retry, stop_after_attempt, wait_exponential

class LLMProvider(ABC):
    @abstractmethod
    async def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        pass

    @abstractmethod
    async def generate_stream(self, system_prompt: str, user_prompt: str) -> AsyncGenerator[str, None]:
        pass

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        # Initialize Gemini API here
        # import google.generativeai as genai
        # genai.configure(api_key=api_key)
        # self.model = genai.GenerativeModel('gemini-pro')

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        # Mock implementation for now
        return "This is a mock Gemini response."

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def generate_stream(self, system_prompt: str, user_prompt: str) -> AsyncGenerator[str, None]:
        # Mock implementation
        yield "This "
        yield "is a "
        yield "mock Gemini stream."

def get_llm_provider() -> LLMProvider:
    from app.core.config import settings
    # For now, just return a mock provider. In production, we instantiate with settings.GEMINI_API_KEY
    return GeminiProvider(api_key=settings.GEMINI_API_KEY)

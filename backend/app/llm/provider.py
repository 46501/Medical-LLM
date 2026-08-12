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

    @abstractmethod
    async def extract_text_from_file(self, file_bytes: bytes, mime_type: str) -> str:
        pass

class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def generate_response(self, system_prompt: str, user_prompt: str) -> str:
        prompt = f"System Instruction: {system_prompt}\n\nUser: {user_prompt}"
        response = await self.model.generate_content_async(prompt)
        return response.text

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def generate_stream(self, system_prompt: str, user_prompt: str) -> AsyncGenerator[str, None]:
        prompt = f"System Instruction: {system_prompt}\n\nUser: {user_prompt}"
        response = await self.model.generate_content_async(prompt, stream=True)
        async for chunk in response:
            try:
                if chunk.text:
                    yield chunk.text
            except ValueError:
                pass

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def extract_text_from_file(self, file_bytes: bytes, mime_type: str) -> str:
        prompt = "Extract all text from this document accurately. Do not summarize or add any commentary. Just return the raw text."
        contents = [
            prompt,
            {
                "mime_type": mime_type,
                "data": file_bytes
            }
        ]
        response = await self.model.generate_content_async(contents)
        return response.text

def get_llm_provider() -> LLMProvider:
    from app.core.config import settings
    # We use a mock provider during Pytest because of rate limiting / no key, but in prod we use real Gemini
    if settings.GEMINI_API_KEY == "testkey" or not settings.GEMINI_API_KEY:
        # Mock provider logic defined locally or fallback (keeping it simple)
        pass # In tests we mock this dependency in conftest.py anyway
    
    return GeminiProvider(api_key=settings.GEMINI_API_KEY)

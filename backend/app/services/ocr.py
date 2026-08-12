from app.llm.provider import LLMProvider

async def extract_text_from_image(image_bytes: bytes, mime_type: str, llm: LLMProvider) -> str:
    try:
        text = await llm.extract_text_from_file(image_bytes, mime_type)
        return text.strip()
    except Exception as e:
        return f"Error extracting text: {str(e)}"

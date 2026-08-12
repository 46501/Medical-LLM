class MedicalSafetyEngine:
    def __init__(self, llm_provider):
        self.llm = llm_provider

    async def is_safe(self, user_input: str) -> tuple[bool, str]:
        """
        Check if the user input is safe to process.
        Returns (is_safe, fallback_message).
        """
        # Very simple heuristic for demonstration. 
        # In production, this would use a small LLM or classification model.
        unsafe_keywords = ["kill myself", "suicide", "overdose", "how to make poison"]
        lower_input = user_input.lower()
        
        for word in unsafe_keywords:
            if word in lower_input:
                return False, "If you're in immediate danger or experiencing a medical emergency, please call your local emergency services (like 911) or go to the nearest emergency room immediately."
                
        emergency_keywords = ["heart attack", "stroke", "severe bleeding", "can't breathe"]
        for word in emergency_keywords:
            if word in lower_input:
                return False, "It sounds like you may be experiencing a medical emergency. Please seek immediate professional medical attention or call emergency services."

        return True, ""

    async def validate_response(self, response: str) -> str:
        """
        Ensure the response contains appropriate disclaimers and doesn't make definitive diagnoses.
        """
        disclaimer = "\n\n**Important:** This information is educational and does not replace evaluation by a qualified healthcare professional."
        if "Important:" not in response:
            return response + disclaimer
        return response

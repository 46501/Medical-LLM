from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ReportAnalysisResponse(BaseModel):
    document_id: int
    test_name: Optional[str]
    extracted_text: str
    explanation: str
    abnormal_values_highlight: Optional[str]
    sources: List[str]
    is_safe: bool = True

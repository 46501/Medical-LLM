from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.document import DocumentResponse, ReportAnalysisResponse
from app.models.document import Document
from app.services.ocr import extract_text_from_image
from app.medical.report_parser import analyze_medical_report

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    llm = Depends(deps.get_llm)
):
    ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.")
        
    # Read file and enforce size limit (5MB)
    MAX_SIZE = 5 * 1024 * 1024
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5MB.")
        
    import os
    import uuid
    safe_filename = os.path.basename(file.filename)
    secure_filename = f"{uuid.uuid4().hex}_{safe_filename}"
    
    extracted_text = await extract_text_from_image(contents, file.content_type, llm)
    
    doc = Document(
        user_id=current_user.id,
        filename=secure_filename,
        file_type=file.content_type,
        content_text=extracted_text
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.post("/{doc_id}/analyze", response_model=ReportAnalysisResponse)
async def analyze_document(
    doc_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
    llm = Depends(deps.get_llm)
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    explanation = await analyze_medical_report(doc.content_text, llm)
    
    return ReportAnalysisResponse(
        document_id=doc.id,
        test_name="Unknown Test (Mock)",
        extracted_text=doc.content_text,
        explanation=explanation,
        abnormal_values_highlight="None identified (Mock)",
        sources=["MedlinePlus", "WHO"],
        is_safe=True
    )

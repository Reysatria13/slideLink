"""
SlideLink Models - Pydantic models for API request/response
"""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field


# ============================================================
# API Request Models
# ============================================================

class TranslationEdit(BaseModel):
    """Single translation edit from user"""
    shape_id: int
    translated: str


class PreviewUpdateRequest(BaseModel):
    """Request to update translations in preview"""
    translations: List[TranslationEdit]


# ============================================================
# API Response Models
# ============================================================

class BoundingBoxResponse(BaseModel):
    """Bounding box info for a shape"""
    left: int
    top: int
    width: int
    height: int


class TranslationPreviewItem(BaseModel):
    """Single translation item in preview"""
    shape_id: int
    slide_index: int
    shape_name: str
    original: str
    translated: str
    char_count: int
    max_chars: int
    fits_box: bool
    was_shortened: bool = False
    bounding_box: BoundingBoxResponse


class UploadResponse(BaseModel):
    """Response from /upload endpoint"""
    session_id: str
    source_lang: str
    target_lang: str
    slide_count: int
    shape_count: int
    preview: List[TranslationPreviewItem]


class PreviewResponse(BaseModel):
    """Response from /preview endpoint"""
    session_id: str
    source_lang: str
    target_lang: str
    preview: List[TranslationPreviewItem]


class ConfirmResponse(BaseModel):
    """Response from /confirm endpoint"""
    session_id: str
    download_url: str
    message: str


class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    detail: Optional[str] = None


# ============================================================
# Internal Session Data
# ============================================================

class SessionData(BaseModel):
    """Data stored in session"""
    session_id: str
    source_file_path: str
    source_lang: str
    target_lang: str
    slide_count: int
    created_at: float
    translations: Dict[int, TranslationPreviewItem] = Field(default_factory=dict)
    output_file_path: Optional[str] = None

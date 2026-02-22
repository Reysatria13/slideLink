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
    slide_index: int = 0
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
    shape_type: str = "unknown"
    rotation: float = 0.0
    bg_color: Optional[str] = None
    font_color: Optional[str] = None
    font_size_pt: Optional[float] = None
    original: str
    translated: str
    char_count: int
    max_chars: int
    fits_box: bool
    was_shortened: bool = False
    alternative_short: Optional[str] = None
    confidence: float = 1.0
    bounding_box: BoundingBoxResponse


class UploadResponse(BaseModel):
    """Response from /upload endpoint"""
    session_id: str
    source_lang: str
    target_lang: str
    slide_count: int
    shape_count: int
    slide_width_px: Optional[int] = None
    slide_height_px: Optional[int] = None
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


class ChatAction(BaseModel):
    type: str
    target_shape_id: Optional[int] = None
    slide_index: Optional[int] = None
    property: Optional[str] = None
    value: Optional[str] = None
    text: Optional[str] = None
    shape_type: Optional[str] = None
    bounding_box: Optional[Dict] = None

class ChatSource(BaseModel):
    title: str
    url: str

class ChatRequest(BaseModel):
    message: str
    slide_context: List[dict]

class ChatResponse(BaseModel):
    message: str
    thinking: List[str] = Field(default_factory=list)
    actions: List[ChatAction] = Field(default_factory=list)
    sources: List[ChatSource] = Field(default_factory=list)


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
    translations: Dict[str, TranslationPreviewItem] = Field(default_factory=dict)
    chat_history: List[Dict] = Field(default_factory=list)
    output_file_path: Optional[str] = None

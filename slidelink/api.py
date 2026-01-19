"""
SlideLink API - FastAPI server for web-based translation workflow

Endpoints:
    POST /upload       - Upload PPTX, extract & translate, return preview
    GET  /preview/{id} - Get current translation state
    PUT  /preview/{id} - Edit translations
    POST /confirm/{id} - Finalize and generate output file
    GET  /download/{id} - Download translated PPTX
"""

import os
import asyncio
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil

from .models import (
    UploadResponse,
    PreviewResponse,
    PreviewUpdateRequest,
    ConfirmResponse,
    TranslationPreviewItem,
    BoundingBoxResponse,
    ErrorResponse
)
from .session import session_manager
from .core.extractor import extract_presentation
from .core.translator import Translator
from .core.reconstructor import reconstruct_with_custom_translations


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - start cleanup loop on startup"""
    # Start background cleanup task
    cleanup_task = asyncio.create_task(session_manager.start_cleanup_loop())
    yield
    # Cleanup on shutdown
    cleanup_task.cancel()
    session_manager.shutdown()


app = FastAPI(
    title="SlideLink API",
    description="Layout-preserving PowerPoint translation API",
    version="0.1.0",
    lifespan=lifespan
)

# Add CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ENDPOINTS
# ============================================================

@app.post("/upload", response_model=UploadResponse)
async def upload_and_translate(
    file: UploadFile = File(...),
    source_lang: str = Form(default="Japanese"),
    target_lang: str = Form(default="English")
):
    """
    Upload a PPTX file, extract text, translate, and return preview.

    The session ID in the response is used for subsequent operations.
    """
    # Validate file type
    if not file.filename.endswith(".pptx"):
        raise HTTPException(
            status_code=400,
            detail="Only .pptx files are supported"
        )

    # Save uploaded file
    temp_path = session_manager.get_temp_path(file.filename)
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        # Extract text
        extraction = extract_presentation(temp_path)

        if not extraction.shapes:
            os.remove(temp_path)
            raise HTTPException(
                status_code=400,
                detail="No text found in presentation"
            )

        # Translate
        translator = Translator()
        translator.set_languages(source_lang, target_lang)
        translations = translator.translate_all(extraction.shapes)

        # Create session
        session_id = session_manager.create_session(
            source_file_path=temp_path,
            source_lang=source_lang,
            target_lang=target_lang,
            slide_count=extraction.slide_count
        )

        # Build preview items and store in session
        preview_items = {}
        preview_list = []

        for t, shape in zip(translations, extraction.shapes):
            item = TranslationPreviewItem(
                shape_id=t.shape_id,
                slide_index=t.slide_index,
                shape_name=shape.shape_name,
                original=t.original_text,
                translated=t.translated_text,
                char_count=t.char_count,
                max_chars=t.max_chars,
                fits_box=t.fits_box,
                was_shortened=t.was_shortened,
                bounding_box=BoundingBoxResponse(
                    left=shape.bounding_box.left,
                    top=shape.bounding_box.top,
                    width=shape.bounding_box.width,
                    height=shape.bounding_box.height
                )
            )
            preview_items[t.shape_id] = item
            preview_list.append(item)

        session_manager.update_translations(session_id, preview_items)

        return UploadResponse(
            session_id=session_id,
            source_lang=source_lang,
            target_lang=target_lang,
            slide_count=extraction.slide_count,
            shape_count=len(translations),
            preview=preview_list
        )

    except HTTPException:
        raise
    except ValueError as e:
        os.remove(temp_path)
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        os.remove(temp_path)
        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(e)}"
        )


@app.get("/preview/{session_id}", response_model=PreviewResponse)
async def get_preview(session_id: str):
    """Get the current translation preview for a session."""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found or expired"
        )

    return PreviewResponse(
        session_id=session_id,
        source_lang=session.source_lang,
        target_lang=session.target_lang,
        preview=list(session.translations.values())
    )


@app.put("/preview/{session_id}", response_model=PreviewResponse)
async def update_preview(session_id: str, request: PreviewUpdateRequest):
    """
    Update translations in the preview.

    Allows user to edit individual translations before confirming.
    """
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found or expired"
        )

    # Update each translation
    for edit in request.translations:
        success = session_manager.update_single_translation(
            session_id=session_id,
            shape_id=edit.shape_id,
            translated_text=edit.translated
        )
        if not success:
            raise HTTPException(
                status_code=400,
                detail=f"Shape {edit.shape_id} not found in session"
            )

    # Return updated preview
    session = session_manager.get_session(session_id)
    return PreviewResponse(
        session_id=session_id,
        source_lang=session.source_lang,
        target_lang=session.target_lang,
        preview=list(session.translations.values())
    )


@app.post("/confirm/{session_id}", response_model=ConfirmResponse)
async def confirm_translation(session_id: str):
    """
    Finalize translations and generate the output PPTX file.

    After confirmation, use /download/{session_id} to get the file.
    """
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found or expired"
        )

    # Build translation dict
    translations = {
        shape_id: item.translated
        for shape_id, item in session.translations.items()
    }

    # Generate output file
    output_path = session.source_file_path.replace(".pptx", "_translated.pptx")

    try:
        reconstruct_with_custom_translations(
            original_path=session.source_file_path,
            translations=translations,
            output_path=output_path
        )
        session_manager.set_output_path(session_id, output_path)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate output: {str(e)}"
        )

    return ConfirmResponse(
        session_id=session_id,
        download_url=f"/download/{session_id}",
        message="Translation confirmed. Ready for download."
    )


@app.get("/download/{session_id}")
async def download_file(session_id: str):
    """
    Download the translated PPTX file.

    The session is cleaned up after download.
    """
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found or expired"
        )

    if not session.output_file_path or not os.path.exists(session.output_file_path):
        raise HTTPException(
            status_code=400,
            detail="Output file not ready. Call /confirm first."
        )

    # Get original filename for download
    original_name = os.path.basename(session.source_file_path)
    download_name = original_name.replace(".pptx", "_translated.pptx")

    response = FileResponse(
        session.output_file_path,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        filename=download_name
    )

    # Schedule cleanup after response is sent
    # Note: In production, you might want to delay this or use a callback
    # For POC, we leave the session for potential re-downloads

    return response


@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Manually delete a session and its files."""
    success = session_manager.delete_session(session_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )
    return {"message": "Session deleted"}


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "SlideLink API"}

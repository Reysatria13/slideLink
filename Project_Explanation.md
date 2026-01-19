# SlideLink - Project Documentation

> **Layout-Preserving PowerPoint Translation System**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Directory Structure](#directory-structure)
4. [Core Components](#core-components)
5. [Pipeline Flow](#pipeline-flow)
6. [API Reference](#api-reference)
7. [Data Models](#data-models)
8. [Session Management](#session-management)
9. [Technical Implementation Details](#technical-implementation-details)
10. [Dependencies](#dependencies)
11. [Usage Examples](#usage-examples)
12. [Configuration](#configuration)

---

## Project Overview

### What is SlideLink?

SlideLink is an AI-powered translation system specifically designed for PowerPoint presentations. Unlike traditional translation tools that often break layouts or require manual repositioning, SlideLink intelligently translates text while **preserving the original slide design, positioning, and formatting**.

### Key Innovation: Constraint-Aware Translation

The core innovation of SlideLink is its **bounding box constraint system**. When translating text, the system:

1. Extracts the exact position and dimensions of each text box
2. Calculates the maximum characters that can fit in that space
3. Passes these constraints to the AI during translation
4. Automatically shortens translations if they exceed the available space

This ensures translations fit within the original layout without overflow or design breakage.

### Problem Statement

| Traditional Translation | SlideLink Approach |
|------------------------|-------------------|
| Breaks slide layouts | Preserves exact positioning |
| Requires manual adjustment | Fully automated |
| Ignores space constraints | Constraint-aware AI translation |
| Time-consuming (2-3 hours) | Fast (~5 minutes) |
| Inconsistent terminology | AI-driven consistency |

### Target Use Cases

- Corporate presentations requiring localization
- Internal documentation translation
- Marketing materials for global audiences
- Educational content internationalization

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SlideLink System                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐  │
│  │   FastAPI   │    │   Session   │    │      Core Pipeline      │  │
│  │    Server   │◄──►│   Manager   │◄──►│                         │  │
│  │   (api.py)  │    │(session.py) │    │  ┌───────────────────┐  │  │
│  └─────────────┘    └─────────────┘    │  │    Extractor      │  │  │
│         │                              │  │  (extractor.py)   │  │  │
│         │                              │  └─────────┬─────────┘  │  │
│         ▼                              │            │            │  │
│  ┌─────────────┐                       │            ▼            │  │
│  │    CLI      │                       │  ┌───────────────────┐  │  │
│  │  (cli.py)   │                       │  │   Translator      │  │  │
│  └─────────────┘                       │  │  (translator.py)  │  │  │
│                                        │  └─────────┬─────────┘  │  │
│                                        │            │            │  │
│                                        │            ▼            │  │
│                                        │  ┌───────────────────┐  │  │
│                                        │  │  Reconstructor    │  │  │
│                                        │  │(reconstructor.py) │  │  │
│                                        │  └───────────────────┘  │  │
│                                        └─────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │    Gemini API         │
                        │  (Google AI Studio)   │
                        └───────────────────────┘
```

### Component Interaction Flow

```
User Request
     │
     ▼
┌────────────────────────────────────────────────────────────────┐
│                        Entry Points                             │
│  ┌──────────────────┐          ┌──────────────────┐            │
│  │   Web API        │          │   CLI            │            │
│  │   POST /upload   │          │   slidelink      │            │
│  └────────┬─────────┘          └────────┬─────────┘            │
└───────────┼─────────────────────────────┼──────────────────────┘
            │                             │
            └──────────────┬──────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │       Core Pipeline          │
            │                              │
            │   1. extract_presentation()  │
            │   2. Translator.translate()  │
            │   3. reconstruct_presentation│
            │                              │
            └──────────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │    Translated PPTX Output    │
            └──────────────────────────────┘
```

---

## Directory Structure

```
slidelink/
├── __init__.py              # Package initialization, version info
├── api.py                   # FastAPI web server with REST endpoints
├── cli.py                   # Command-line interface
├── models.py                # Pydantic models for API request/response
├── session.py               # In-memory session management
└── core/
    ├── __init__.py          # Core module exports
    ├── extractor.py         # PPTX text extraction with bounding boxes
    ├── translator.py        # Gemini API integration for translation
    └── reconstructor.py     # PPTX reconstruction with translated text

# Supporting files
├── requirements.txt         # Python dependencies
├── .gitignore              # Git ignore patterns
├── .env                    # Environment variables (API keys)
├── sample_japanese.pptx    # Sample input file
├── sample_english.pptx     # Sample output file
├── extract_with_bbox.py    # Standalone extraction demo
├── slidelink_pipeline.py   # Complete pipeline demo
├── extracted_metadata.json # Sample extracted metadata
└── EXPLORATION_GUIDE.md    # python-pptx exploration notes
```

---

## Core Components

### 1. Extractor (`slidelink/core/extractor.py`)

The extractor module parses PPTX files and extracts text along with positional metadata.

#### Key Data Structures

```python
@dataclass
class BoundingBox:
    """Bounding box for a shape in pixels (96 DPI)"""
    left: int       # X position from left edge
    top: int        # Y position from top edge
    width: int      # Shape width
    height: int     # Shape height
    # EMU values for reference
    left_emu: int
    top_emu: int
    width_emu: int
    height_emu: int

@dataclass
class ShapeData:
    """Extracted data for a single shape"""
    shape_id: int                    # Unique identifier
    shape_name: str                  # Display name
    slide_index: int                 # Which slide (0-indexed)
    text: str                        # Full text content
    paragraphs: List[Paragraph]      # Individual paragraphs
    bounding_box: BoundingBox        # Position and size
    estimated_max_chars: int         # How many chars can fit
    primary_font_size_pt: float      # Main font size

@dataclass
class ExtractionResult:
    """Result of extracting a presentation"""
    source_file: str
    slide_width_px: int
    slide_height_px: int
    slide_count: int
    shapes: List[ShapeData]
```

#### Key Functions

| Function | Purpose |
|----------|---------|
| `extract_presentation(pptx_path)` | Main extraction entry point |
| `emu_to_px(emu, dpi=96)` | Convert EMU to pixels |
| `emu_to_pt(emu)` | Convert EMU to points |
| `estimate_max_chars(width, height, font_size)` | Calculate character capacity |

#### EMU (English Metric Units)

PowerPoint uses EMU as its internal measurement unit:
- **914400 EMU = 1 inch**
- **914400 EMU = 72 points**
- **914400 EMU = 96 pixels** (at 96 DPI)

---

### 2. Translator (`slidelink/core/translator.py`)

The translator module integrates with Google's Gemini API to perform constraint-aware translation.

#### Class: `Translator`

```python
class Translator:
    """Gemini-powered translator with bounding box constraints"""

    def __init__(self, api_key=None, model="gemini-3-pro-preview"):
        """Initialize with API key and model selection"""

    def set_languages(self, source: str, target: str):
        """Set source and target languages"""

    def translate_shape(self, shape: ShapeData) -> TranslationResult:
        """Translate a single shape with constraints"""

    def translate_all(self, shapes: List[ShapeData]) -> List[TranslationResult]:
        """Translate all shapes in a presentation"""
```

#### Translation Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Translation Process                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Receive ShapeData with text and bounding box                │
│                        │                                         │
│                        ▼                                         │
│  2. Calculate max_chars (90% of estimated capacity)             │
│                        │                                         │
│                        ▼                                         │
│  3. Generate prompt with constraints:                           │
│     ┌────────────────────────────────────────────┐              │
│     │ "Translate from {source} to {target}       │              │
│     │  TEXT: {original_text}                     │              │
│     │  CONSTRAINTS:                              │              │
│     │  - Bounding box: {width}px x {height}px    │              │
│     │  - Font size: {font_size}pt                │              │
│     │  - Max characters: {max_chars}"            │              │
│     └────────────────────────────────────────────┘              │
│                        │                                         │
│                        ▼                                         │
│  4. Send to Gemini API                                          │
│                        │                                         │
│                        ▼                                         │
│  5. Parse JSON response: {"translation": "...", "char_count": N}│
│                        │                                         │
│                        ▼                                         │
│  6. Check if translation fits                                   │
│     ┌─────────┴─────────┐                                       │
│     │                   │                                        │
│   FITS              TOO LONG                                    │
│     │                   │                                        │
│     ▼                   ▼                                        │
│  Return           Request shorter                               │
│  result           version (retry once)                          │
│                         │                                        │
│                         ▼                                        │
│                   Return result                                  │
│                   (may still overflow)                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### TranslationResult

```python
@dataclass
class TranslationResult:
    shape_id: int           # Links back to original shape
    slide_index: int        # Which slide
    original_text: str      # Source text
    translated_text: str    # Translated text
    char_count: int         # Length of translation
    max_chars: int          # Maximum allowed
    fits_box: bool          # Whether it fits
    was_shortened: bool     # If auto-shortened
```

---

### 3. Reconstructor (`slidelink/core/reconstructor.py`)

The reconstructor creates the output PPTX by replacing text in the original file while preserving all formatting.

#### Key Functions

| Function | Purpose |
|----------|---------|
| `reconstruct_presentation(original_path, translations, output_path)` | Main reconstruction from TranslationResult list |
| `reconstruct_with_custom_translations(original_path, translations, output_path)` | Reconstruction from dict (for API use) |

#### Reconstruction Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                   Reconstruction Process                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Open original PPTX as template                              │
│     prs = Presentation(original_path)                           │
│                                                                  │
│  2. Create lookup: shape_id → translated_text                   │
│                                                                  │
│  3. For each slide:                                             │
│     For each shape with text:                                   │
│       If shape_id in translations:                              │
│         │                                                        │
│         ▼                                                        │
│       Split translated text by newlines                         │
│         │                                                        │
│         ▼                                                        │
│       For each paragraph:                                       │
│         ┌─────────────────────────────────────────┐             │
│         │ PRESERVE FORMATTING STRATEGY:           │             │
│         │                                         │             │
│         │ if paragraph has runs:                  │             │
│         │   runs[0].text = new_text  # Keep font  │             │
│         │   runs[1:].text = ""       # Clear rest │             │
│         │ else:                                   │             │
│         │   paragraph.text = new_text             │             │
│         └─────────────────────────────────────────┘             │
│                                                                  │
│  4. Save to output path                                         │
│     prs.save(output_path)                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Why this approach preserves formatting:**
- Font family, size, color, bold/italic are stored in the Run object
- By updating only `run.text`, all formatting attributes remain intact
- Position (bounding box) is a Shape property, never modified

---

## Pipeline Flow

### Complete Translation Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SlideLink Translation Pipeline                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                        INPUT: sample_japanese.pptx                   │
│                                    │                                 │
│                                    ▼                                 │
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║  PHASE 1: EXTRACTION                                          ║  │
│  ║                                                                ║  │
│  ║  extract_presentation(pptx_path)                              ║  │
│  ║      │                                                        ║  │
│  ║      ├── Open PPTX with python-pptx                          ║  │
│  ║      ├── Iterate through slides                               ║  │
│  ║      ├── For each shape with text_frame:                     ║  │
│  ║      │     ├── Extract text content                          ║  │
│  ║      │     ├── Get bounding box (left, top, width, height)   ║  │
│  ║      │     ├── Get font size from runs                       ║  │
│  ║      │     └── Calculate estimated_max_chars                 ║  │
│  ║      └── Return ExtractionResult                             ║  │
│  ║                                                                ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                    │                                 │
│                                    ▼                                 │
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║  PHASE 2: TRANSLATION                                         ║  │
│  ║                                                                ║  │
│  ║  translator.translate_all(shapes)                             ║  │
│  ║      │                                                        ║  │
│  ║      For each shape:                                          ║  │
│  ║      ├── Build constraint-aware prompt                       ║  │
│  ║      ├── Call Gemini API                                     ║  │
│  ║      ├── Parse JSON response                                 ║  │
│  ║      ├── Check if fits bounding box                          ║  │
│  ║      ├── If too long: request shortened version              ║  │
│  ║      └── Return TranslationResult                            ║  │
│  ║                                                                ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                    │                                 │
│                                    ▼                                 │
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║  PHASE 3: RECONSTRUCTION                                      ║  │
│  ║                                                                ║  │
│  ║  reconstruct_presentation(original, translations, output)     ║  │
│  ║      │                                                        ║  │
│  ║      ├── Open original PPTX (as template)                    ║  │
│  ║      ├── Create shape_id → text mapping                      ║  │
│  ║      ├── For each shape in presentation:                     ║  │
│  ║      │     └── Replace text while preserving formatting      ║  │
│  ║      └── Save to output path                                 ║  │
│  ║                                                                ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                    │                                 │
│                                    ▼                                 │
│                       OUTPUT: sample_english.pptx                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### What Gets Preserved

| Element | Preserved? | How |
|---------|------------|-----|
| Slide dimensions | Yes | Never modified |
| Shape positions | Yes | Bounding box untouched |
| Shape sizes | Yes | Width/height unchanged |
| Font family | Yes | Run formatting kept |
| Font size | Yes | Run formatting kept |
| Font color | Yes | Run formatting kept |
| Bold/Italic | Yes | Run formatting kept |
| Text alignment | Yes | Paragraph property kept |
| Images | Yes | Not text, ignored |
| Charts | Yes | Not text shapes |
| Animations | Yes | Stored separately |
| Transitions | Yes | Slide-level property |

---

## API Reference

### FastAPI Server (`slidelink/api.py`)

The web API provides a complete workflow for browser-based translation.

### Endpoints Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/upload` | Upload PPTX, extract, translate, return preview |
| `GET` | `/preview/{session_id}` | Get current translation state |
| `PUT` | `/preview/{session_id}` | Edit translations before finalizing |
| `POST` | `/confirm/{session_id}` | Finalize and generate output file |
| `GET` | `/download/{session_id}` | Download translated PPTX |
| `DELETE` | `/session/{session_id}` | Manually delete session |
| `GET` | `/health` | Health check |

---

### POST `/upload`

Upload and translate a PowerPoint file.

**Request:**
```
Content-Type: multipart/form-data

file: <pptx file>
source_lang: "Japanese" (optional, default)
target_lang: "English" (optional, default)
```

**Response:**
```json
{
  "session_id": "uuid-string",
  "source_lang": "Japanese",
  "target_lang": "English",
  "slide_count": 2,
  "shape_count": 7,
  "preview": [
    {
      "shape_id": 2,
      "slide_index": 0,
      "shape_name": "TextBox 1",
      "original": "2025年度 事業計画",
      "translated": "FY2025 Business Plan",
      "char_count": 20,
      "max_chars": 664,
      "fits_box": true,
      "was_shortened": false,
      "bounding_box": {
        "left": 48,
        "top": 192,
        "width": 1183,
        "height": 144
      }
    }
    // ... more items
  ]
}
```

---

### GET `/preview/{session_id}`

Retrieve current translation state.

**Response:**
```json
{
  "session_id": "uuid-string",
  "source_lang": "Japanese",
  "target_lang": "English",
  "preview": [/* TranslationPreviewItem array */]
}
```

---

### PUT `/preview/{session_id}`

Edit translations before finalizing.

**Request:**
```json
{
  "translations": [
    {
      "shape_id": 2,
      "translated": "2025 Business Plan"
    },
    {
      "shape_id": 3,
      "translated": "AI Strategy Department"
    }
  ]
}
```

**Response:** Updated preview (same as GET)

---

### POST `/confirm/{session_id}`

Generate the final translated PPTX file.

**Response:**
```json
{
  "session_id": "uuid-string",
  "download_url": "/download/{session_id}",
  "message": "Translation confirmed. Ready for download."
}
```

---

### GET `/download/{session_id}`

Download the translated file.

**Response:** Binary file download with headers:
```
Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation
Content-Disposition: attachment; filename="original_translated.pptx"
```

---

### API Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    API Workflow                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Client                          Server                         │
│     │                               │                            │
│     │  POST /upload (file)          │                            │
│     │──────────────────────────────►│                            │
│     │                               │  1. Save file              │
│     │                               │  2. Extract text           │
│     │                               │  3. Translate all          │
│     │                               │  4. Create session         │
│     │  {session_id, preview}        │                            │
│     │◄──────────────────────────────│                            │
│     │                               │                            │
│     │  [User reviews preview]       │                            │
│     │                               │                            │
│     │  PUT /preview/{id}            │                            │
│     │  (optional edits)             │                            │
│     │──────────────────────────────►│                            │
│     │                               │  Update translations       │
│     │  {updated preview}            │                            │
│     │◄──────────────────────────────│                            │
│     │                               │                            │
│     │  POST /confirm/{id}           │                            │
│     │──────────────────────────────►│                            │
│     │                               │  Reconstruct PPTX          │
│     │  {download_url}               │                            │
│     │◄──────────────────────────────│                            │
│     │                               │                            │
│     │  GET /download/{id}           │                            │
│     │──────────────────────────────►│                            │
│     │  <binary pptx file>           │                            │
│     │◄──────────────────────────────│                            │
│     │                               │                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Pydantic Models (`slidelink/models.py`)

#### Request Models

```python
class TranslationEdit(BaseModel):
    """Single translation edit from user"""
    shape_id: int
    translated: str

class PreviewUpdateRequest(BaseModel):
    """Request to update translations in preview"""
    translations: List[TranslationEdit]
```

#### Response Models

```python
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
```

#### Internal Session Model

```python
class SessionData(BaseModel):
    """Data stored in session"""
    session_id: str
    source_file_path: str
    source_lang: str
    target_lang: str
    slide_count: int
    created_at: float
    translations: Dict[int, TranslationPreviewItem] = {}
    output_file_path: Optional[str] = None
```

---

## Session Management

### SessionManager (`slidelink/session.py`)

The session manager provides in-memory storage for translation workflows with automatic cleanup.

#### Features

| Feature | Description |
|---------|-------------|
| UUID-based sessions | Each upload gets a unique session ID |
| 1-hour expiry | Sessions auto-expire after 3600 seconds |
| Background cleanup | Async task cleans expired sessions every 5 minutes |
| Thread-safe | Uses threading.Lock for concurrent access |
| Temp file management | Handles upload/output file lifecycle |

#### Session Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    Session Lifecycle                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  create_session()                                               │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────┐                                        │
│  │  ACTIVE SESSION     │                                        │
│  │                     │                                        │
│  │  - session_id       │                                        │
│  │  - source_file_path │──────────────────┐                     │
│  │  - translations     │                  │                     │
│  │  - created_at       │                  │                     │
│  └─────────────────────┘                  │                     │
│       │                                   │                     │
│       │ update_translations()             │                     │
│       │ update_single_translation()       │                     │
│       │ set_output_path()                 │                     │
│       │                                   │                     │
│       ▼                                   ▼                     │
│  ┌─────────────────────┐        ┌─────────────────────┐        │
│  │  READY FOR          │        │  EXPIRY CHECK       │        │
│  │  DOWNLOAD           │        │  (every 5 min)      │        │
│  │                     │        │                     │        │
│  │  - output_file_path │        │  if age > 1 hour:   │        │
│  └─────────────────────┘        │    cleanup_session()│        │
│       │                         └─────────────────────┘        │
│       │                                   │                     │
│       │ delete_session()                  │                     │
│       │ (manual or auto)                  │                     │
│       ▼                                   ▼                     │
│  ┌─────────────────────────────────────────────────────┐       │
│  │                    CLEANUP                           │       │
│  │                                                      │       │
│  │  1. Remove source_file_path                         │       │
│  │  2. Remove output_file_path (if exists)             │       │
│  │  3. Remove session from memory                      │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Key Methods

```python
class SessionManager:
    EXPIRY_SECONDS = 3600  # 1 hour

    def create_session(source_file_path, source_lang, target_lang, slide_count) -> str:
        """Create new session, return session_id"""

    def get_session(session_id) -> Optional[SessionData]:
        """Get session, returns None if expired/not found"""

    def update_translations(session_id, translations: Dict) -> bool:
        """Update all translations for a session"""

    def update_single_translation(session_id, shape_id, translated_text) -> bool:
        """Update one translation"""

    def set_output_path(session_id, output_path) -> bool:
        """Set output file path after reconstruction"""

    def delete_session(session_id) -> bool:
        """Delete session and cleanup files"""

    def get_temp_path(filename) -> str:
        """Get path for temporary file storage"""

    async def start_cleanup_loop(interval=300):
        """Background task for expired session cleanup"""

    def shutdown():
        """Clean up all sessions and temp directory"""
```

---

## Technical Implementation Details

### PowerPoint File Structure

PPTX files are actually ZIP archives containing XML files:

```
sample.pptx (ZIP archive)
├── [Content_Types].xml
├── _rels/
│   └── .rels
├── docProps/
│   ├── app.xml
│   └── core.xml
└── ppt/
    ├── presentation.xml      # Main presentation data
    ├── presProps.xml
    ├── tableStyles.xml
    ├── viewProps.xml
    ├── _rels/
    │   └── presentation.xml.rels
    ├── slideLayouts/         # Layout templates
    ├── slideMasters/         # Master slides
    ├── slides/
    │   ├── slide1.xml        # Slide content
    │   ├── slide2.xml
    │   └── _rels/
    └── theme/
        └── theme1.xml        # Theme definitions
```

### Shape XML Structure

Each shape's position is stored in XML:

```xml
<p:sp>
  <p:spPr>
    <a:xfrm>
      <a:off x="914400" y="1828800"/>  <!-- Position in EMU -->
      <a:ext cx="11277600" cy="1371600"/>  <!-- Size in EMU -->
    </a:xfrm>
  </p:spPr>
  <p:txBody>
    <a:p>
      <a:r>
        <a:rPr lang="ja-JP" sz="4400"/>  <!-- Font size in 100ths of point -->
        <a:t>2025年度 事業計画</a:t>
      </a:r>
    </a:p>
  </p:txBody>
</p:sp>
```

### Character Estimation Algorithm

```python
def estimate_max_chars(width_px: int, height_px: int, font_size_pt: float = 16.0) -> int:
    """
    Estimate maximum characters that fit in a bounding box.

    Assumptions:
    - Average character width ≈ 0.6 × font_size (varies by font)
    - Line height ≈ 1.5 × font_size
    - This is conservative for CJK characters (typically wider)
    """
    char_width = font_size_pt * 0.6   # Average Latin character
    line_height = font_size_pt * 1.5  # Standard line spacing

    chars_per_line = int(width_px / char_width)
    num_lines = int(height_px / line_height)

    return chars_per_line * num_lines
```

### Gemini API Integration

The system uses Google's Gemini API with structured JSON output:

```python
TRANSLATION_PROMPT = """Translate the following text from {source_lang} to {target_lang}.

TEXT:
{text}

CONSTRAINTS:
- Bounding box: {width}px x {height}px
- Font size: {font_size}pt
- Maximum recommended characters: {max_chars}

RULES:
1. Translation must be concise to fit the bounding box
2. Preserve tone (formal/informal)
3. Keep proper nouns unchanged
4. If translation is naturally short enough, use it directly

Return ONLY valid JSON (no markdown, no code blocks):
{{"translation": "your translation", "char_count": <number>}}"""
```

---

## Dependencies

### requirements.txt

```
python-pptx>=0.6.21      # PowerPoint file manipulation
google-generativeai>=0.4.0  # Gemini API client
fastapi>=0.109.0         # Web framework
uvicorn>=0.27.0          # ASGI server
python-multipart>=0.0.6  # File upload handling
python-dotenv>=1.0.0     # Environment variable loading
pydantic>=2.0.0          # Data validation
```

### Dependency Purposes

| Package | Purpose |
|---------|---------|
| `python-pptx` | Read/write PPTX files, access shape properties |
| `google-generativeai` | Gemini API for AI translation |
| `fastapi` | REST API framework with automatic OpenAPI docs |
| `uvicorn` | High-performance ASGI server |
| `python-multipart` | Handle multipart/form-data file uploads |
| `python-dotenv` | Load API keys from .env file |
| `pydantic` | Request/response validation and serialization |

---

## Usage Examples

### CLI Usage

```bash
# Basic usage (Japanese → English)
python -m slidelink.cli input.pptx

# Specify languages
python -m slidelink.cli input.pptx --source Japanese --target English

# Custom output path
python -m slidelink.cli input.pptx --output translated_output.pptx

# Verbose mode (show translation details)
python -m slidelink.cli input.pptx --verbose
```

**CLI Output Example:**
```
============================================================
SlideLink - Layout-Preserving Translation
============================================================
Input:  sample_japanese.pptx
Output: sample_japanese_translated.pptx
Languages: Japanese -> English

[1/3] Extracting text from presentation...
      Found 7 text boxes across 2 slides

[2/3] Translating with Gemini API...
INFO:slidelink.core.translator:Translating 1/7: TextBox 1
INFO:slidelink.core.translator:Translating 2/7: TextBox 2
...

[3/3] Reconstructing presentation...
      Saved to: sample_japanese_translated.pptx

============================================================
Done! Translation complete.
============================================================
```

### API Usage

```bash
# Start the server
uvicorn slidelink.api:app --reload --port 8000

# Upload and translate
curl -X POST "http://localhost:8000/upload" \
  -F "file=@sample_japanese.pptx" \
  -F "source_lang=Japanese" \
  -F "target_lang=English"

# Edit a translation
curl -X PUT "http://localhost:8000/preview/{session_id}" \
  -H "Content-Type: application/json" \
  -d '{"translations": [{"shape_id": 2, "translated": "Custom translation"}]}'

# Finalize
curl -X POST "http://localhost:8000/confirm/{session_id}"

# Download
curl -O "http://localhost:8000/download/{session_id}"
```

### Programmatic Usage

```python
from slidelink.core import extract_presentation, Translator, reconstruct_presentation

# Step 1: Extract
extraction = extract_presentation("input.pptx")
print(f"Found {len(extraction.shapes)} text shapes")

# Step 2: Translate
translator = Translator()
translator.set_languages("Japanese", "English")
translations = translator.translate_all(extraction.shapes)

# Step 3: Reconstruct
output_path = reconstruct_presentation(
    "input.pptx",
    translations,
    "output.pptx"
)
print(f"Saved to: {output_path}")
```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Required: Gemini API Key
GEMINI_API_KEY=your_api_key_here

# Optional: Custom model (default: gemini-3-pro-preview)
GEMINI_MODEL=gemini-3-pro-preview
```

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### Server Configuration

The FastAPI server can be configured via uvicorn:

```bash
# Development (with auto-reload)
uvicorn slidelink.api:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn slidelink.api:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Comparison: SlideLink vs Traditional Approaches

| Aspect | Traditional Tools | SlideLink |
|--------|------------------|-----------|
| **Layout** | Often broken | Preserved exactly |
| **Process** | Manual adjustment | Fully automated |
| **Speed** | 2-3 hours | ~5 minutes |
| **Constraints** | None | AI-aware of space limits |
| **Output** | Often PDF | Editable PPTX |
| **Terminology** | Inconsistent | AI-consistent |
| **Cost** | Manual labor | API calls only |

---

## Future Enhancements

Potential improvements for the system:

1. **Table support** - Translate text within table cells
2. **Chart text** - Handle embedded chart labels
3. **SmartArt** - Process SmartArt text elements
4. **Batch processing** - Multiple files at once
5. **Translation memory** - Reuse past translations
6. **Custom glossaries** - Enforce specific terminology
7. **Font auto-sizing** - Dynamically adjust font if translation is too long
8. **Multi-language** - Support more language pairs
9. **Progress webhooks** - Real-time translation progress
10. **Docker deployment** - Containerized deployment

---

## License

This project is proprietary software developed for internal use.

---

*Documentation generated from codebase analysis using Repomix v1.11.1*

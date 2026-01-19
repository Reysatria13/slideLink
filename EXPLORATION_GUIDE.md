# python-pptx Exploration for SlideLink

## Overview

`python-pptx` is the core library for SlideLink. It allows you to:
1. **Read** PPTX files and extract text with position metadata
2. **Modify** existing presentations (translate text while preserving layout)
3. **Create** new presentations programmatically

---

## Installation

```bash
pip install python-pptx
```

---

## Key Concepts

### 1. EMU (English Metric Units)
PowerPoint uses EMU as its internal unit of measurement:
- **914400 EMU = 1 inch**
- **914400 EMU = 72 points**
- **914400 EMU = 96 pixels** (at 96 DPI)

```python
from pptx.util import Inches, Pt, Emu

# Create a text box 2 inches wide
width = Inches(2)  # Returns EMU value

# Convert EMU to pixels
def emu_to_px(emu, dpi=96):
    return int(emu / 914400 * dpi)
```

### 2. Presentation Structure

```
Presentation
├── slide_width (EMU)
├── slide_height (EMU)
├── slide_layouts (templates)
└── slides
    └── Slide
        └── shapes
            └── Shape
                ├── left (EMU) - X position
                ├── top (EMU) - Y position
                ├── width (EMU)
                ├── height (EMU)
                └── text_frame
                    └── paragraphs
                        └── Paragraph
                            ├── text
                            ├── alignment
                            └── runs
                                └── Run
                                    ├── text
                                    └── font (size, bold, etc.)
```

### 3. Bounding Box

The **bounding box** is the rectangle that contains a shape:
- `left`: X position from slide left edge
- `top`: Y position from slide top edge  
- `width`: Shape width
- `height`: Shape height

**This is the key data for constraint-aware translation!**

---

## Code Examples

### Extract Text with Bounding Box

```python
from pptx import Presentation

def extract_text_with_bbox(pptx_path):
    prs = Presentation(pptx_path)
    
    for slide_num, slide in enumerate(prs.slides, 1):
        print(f"Slide {slide_num}")
        
        for shape in slide.shapes:
            if not shape.has_text_frame:
                continue
            
            # Get bounding box (in EMU)
            bbox = {
                "left": shape.left,
                "top": shape.top,
                "width": shape.width,
                "height": shape.height
            }
            
            # Get text
            text = shape.text_frame.text
            
            print(f"  Text: {text}")
            print(f"  Position: ({bbox['left']}, {bbox['top']})")
            print(f"  Size: {bbox['width']} x {bbox['height']}")
```

### Modify Text While Preserving Layout

```python
from pptx import Presentation

def translate_presentation(input_path, output_path, translations):
    """
    translations = {
        "日本語テキスト": "English text",
        ...
    }
    """
    prs = Presentation(input_path)
    
    for slide in prs.slides:
        for shape in slide.shapes:
            if not shape.has_text_frame:
                continue
            
            for para in shape.text_frame.paragraphs:
                original = para.text
                if original in translations:
                    # Update text in first run, preserve formatting
                    if para.runs:
                        para.runs[0].text = translations[original]
                        for run in para.runs[1:]:
                            run.text = ""
    
    prs.save(output_path)
```

### Calculate Max Characters for Bounding Box

```python
def estimate_max_chars(width_emu, height_emu, font_size_pt=16):
    """
    Estimate how many characters can fit in a bounding box.
    
    This is approximate - actual fit depends on:
    - Font family (Arial vs Times New Roman)
    - Character width (W vs i)
    - Line spacing
    """
    # Convert to pixels (96 DPI)
    width_px = width_emu / 914400 * 96
    height_px = height_emu / 914400 * 96
    
    # Approximate character dimensions
    char_width = font_size_pt * 0.6  # Average character width
    line_height = font_size_pt * 1.5  # Line height
    
    chars_per_line = int(width_px / char_width)
    num_lines = int(height_px / line_height)
    
    return chars_per_line * num_lines
```

---

## SlideLink Pipeline Using python-pptx

```
┌─────────────────────────────────────────────────────────────┐
│                    SlideLink Pipeline                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. EXTRACTION (python-pptx)                                │
│     prs = Presentation(input.pptx)                          │
│     for shape in slide.shapes:                              │
│         text = shape.text_frame.text                        │
│         bbox = (shape.left, shape.top, shape.width, shape.height)
│                                                              │
│  2. CONSTRAINT CALCULATION                                   │
│     max_chars = estimate_max_chars(bbox.width, bbox.height) │
│                                                              │
│  3. AI TRANSLATION (Gemini API)                             │
│     prompt = f"Translate '{text}' to English.               │
│               Max {max_chars} characters.                   │
│               Must fit in {bbox.width}px x {bbox.height}px" │
│                                                              │
│  4. RECONSTRUCTION (python-pptx)                            │
│     for para in shape.text_frame.paragraphs:                │
│         para.runs[0].text = translated_text                 │
│     prs.save(output.pptx)                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Advantages of python-pptx for SlideLink

| Feature | Benefit for SlideLink |
|---------|----------------------|
| **Direct PPTX access** | No conversion needed (unlike PDFMathTranslate) |
| **Bounding box metadata** | Built-in position/size info (no ML detection needed) |
| **Preserves formatting** | Font, size, alignment maintained |
| **Editable output** | PPTX format, not static PDF |
| **Pure Python** | Easy to integrate with FastAPI backend |

---

## Comparison: python-pptx vs PDFMathTranslate Approach

| Aspect | PDFMathTranslate (PDF) | SlideLink (PPTX) |
|--------|------------------------|------------------|
| Layout detection | ML-based (DocLayout-YOLO) | Built-in (PPTX has metadata) |
| Text extraction | PDF parser (pdfminer) | python-pptx |
| Position info | Must be detected | Directly available |
| Output format | PDF (non-editable) | PPTX (editable) |
| Complexity | High (ML models) | Lower (metadata parsing) |

**Key insight**: PPTX files already contain structured layout information, so we don't need complex ML-based layout detection like PDFMathTranslate does for PDF.

---

## Files in This Demo

| File | Description |
|------|-------------|
| `create_sample.py` | Creates a sample Japanese PPTX |
| `extract_with_bbox.py` | Extracts text with bounding box metadata |
| `slidelink_pipeline.py` | Complete pipeline demo (extract → translate → reconstruct) |
| `sample_japanese.pptx` | Input: Japanese presentation |
| `sample_english.pptx` | Output: Translated English presentation |
| `extracted_metadata.json` | JSON with all extracted text and positions |

---

## Next Steps for SlideLink Development

1. **Replace mock translations with Gemini API**
   - Pass bounding box constraints in prompt
   - Request JSON output with `fits_box` flag

2. **Add constraint checking**
   - Verify translation fits before reconstruction
   - Offer alternatives if too long

3. **Build web interface**
   - Upload PPTX
   - Preview side-by-side
   - Edit and download

4. **Handle edge cases**
   - Tables
   - Charts with text
   - SmartArt
   - Master slides

---

## References

- [python-pptx Documentation](https://python-pptx.readthedocs.io/)
- [PPTX File Format (Open XML)](https://docs.microsoft.com/en-us/office/open-xml/structure-of-a-presentationml-document)

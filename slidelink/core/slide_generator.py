"""
SlideLink Generator - Gemini AI agent for generating Slide JSON Schemas from raw data
"""

import os
import json
import logging
from typing import Optional, List, Dict
from google import genai
from dotenv import load_dotenv
from pydantic import BaseModel

from .file_parser import ParsedContent
from ..models import TranslationPreviewItem, BoundingBoxResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SlideGenerator:
    """Uses Gemini to generate structured slide layouts from raw text/data"""

    SYSTEM_PROMPT = """You are an expert presentation designer and data analyst.
Your task is to take raw document data and a user's instructions, and output a complete, professional slide deck in JSON format.

The canvas size is ALWAYS 960px wide by 540px high.
You must position every element (text, shapes, charts) using absolute coordinates (left, top, width, height) to create a beautiful, balanced layout.

RULES:
1. Include a Title Slide (slide_index: 0).
2. Generate 3-5 slides depending on the data.
3. Use a cohesive color palette (e.g., #0f172a for dark text, #0d9488 for teal accents, #ffffff for backgrounds).
4. Do NOT output markdown formatting like ```json. Return raw, parseable JSON.

JSON SCHEMA REQUIREMENT:
You must return an array of shape objects. Each shape must look like this:
[
  {
    "slide_index": 0,
    "shape_id": 1,
    "shape_type": "AUTO_SHAPE",
    "bg_color": "#ffffff",
    "bounding_box": {"left": 0, "top": 0, "width": 960, "height": 540}
  },
  {
    "slide_index": 0,
    "shape_id": 2,
    "shape_type": "TEXT_BOX",
    "translated": "My Pitch Title",
    "font_size_pt": 48,
    "font_color": "#0f172a",
    "bounding_box": {"left": 80, "top": 200, "width": 800, "height": 80}
  }
]
"""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        load_dotenv()
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found.")
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model

    def _parse_json_response(self, text: str) -> list:
        if not text:
            return []
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            text = "\n".join(lines)
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini JSON: {e}\nRaw response (first 500 chars): {text[:500]}")
            return []

    def generate_slides(self, parsed_data: ParsedContent, user_prompt: str) -> List[TranslationPreviewItem]:
        """
        Sends raw data to Gemini to generate a slide schema array.
        """
        logger.info(f"Generating slides from {parsed_data.file_type} data...")
        
        prompt = f"""
USER INSTRUCTION:
{user_prompt if user_prompt else "Summarize this data into a professional presentation."}

RAW DATA:
{parsed_data.text}
"""
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=genai.types.GenerateContentConfig(
                    system_instruction=self.SYSTEM_PROMPT,
                    temperature=0.2,
                ),
            )
            
            # **SAFETY CHECK**: Handle empty responses from Gemini API safety filters
            if not response.text:
                logger.error("Gemini API returned an empty response. This is likely due to a safety filter trigger on the input data.")
                raise ValueError("The AI was unable to process the content of the uploaded file. This can happen due to safety policies regarding personally identifiable information or other sensitive content. Please try a different file.")

            shapes_json = self._parse_json_response(response.text)
            
            # Map raw dicts to our structured Pydantic models
            preview_items = []
            for shape in shapes_json:
                box = shape.get("bounding_box", {})
                
                # Default safety values if AI hallucinates
                item = TranslationPreviewItem(
                    shape_id=shape.get("shape_id", len(preview_items) + 1),
                    slide_index=shape.get("slide_index", 0),
                    shape_name=f"Generated {shape.get('shape_type', 'Shape')}",
                    shape_type=shape.get("shape_type", "TEXT_BOX"),
                    rotation=shape.get("rotation", 0.0),
                    bg_color=shape.get("bg_color"),
                    font_color=shape.get("font_color"),
                    font_size_pt=shape.get("font_size_pt", 18),
                    original=shape.get("translated", ""),  # Fallback for old schema
                    translated=shape.get("translated", ""),
                    char_count=len(shape.get("translated", "")),
                    max_chars=1000,
                    fits_box=True,
                    bounding_box=BoundingBoxResponse(
                        left=box.get("left", 0),
                        top=box.get("top", 0),
                        width=box.get("width", 200),
                        height=box.get("height", 50)
                    )
                )
                preview_items.append(item)
                
            return preview_items

        except Exception as e:
            logger.error(f"Generation failed: {e}")
            raise ValueError(f"AI Generation failed: {str(e)}")

"""
SlideLink Translator - Gemini API integration for constraint-aware translation

Translates text while respecting bounding box constraints.
If translation is too long, logs a warning and requests a shorter version.
"""

import os
import json
import logging
from typing import Optional
from dataclasses import dataclass

import google.generativeai as genai
from dotenv import load_dotenv

from .extractor import ShapeData

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class TranslationResult:
    """Result of translating a single text"""
    shape_id: int
    slide_index: int
    original_text: str
    translated_text: str
    char_count: int
    max_chars: int
    fits_box: bool
    was_shortened: bool = False


class Translator:
    """Gemini-powered translator with bounding box constraints"""

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

    SHORTEN_PROMPT = """The translation "{translation}" is too long ({char_count} chars, max {max_chars}).
Provide a shorter version that preserves the core meaning.

IMPORTANT: Be more concise. Use abbreviations if appropriate. Remove non-essential words.

Return ONLY valid JSON (no markdown, no code blocks):
{{"translation": "shorter version", "char_count": <number>}}"""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-3-pro-preview"):
        """
        Initialize the translator.

        Args:
            api_key: Gemini API key. If None, loads from GEMINI_API_KEY env var.
            model: Gemini model to use.
        """
        load_dotenv()

        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY not found. Set it in .env or pass api_key parameter."
            )

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(model)
        self.source_lang = "Japanese"
        self.target_lang = "English"

    def set_languages(self, source: str, target: str) -> None:
        """Set source and target languages"""
        self.source_lang = source
        self.target_lang = target

    def _parse_json_response(self, response_text: str) -> dict:
        """Parse JSON from Gemini response, handling potential markdown wrapping"""
        text = response_text.strip()

        # Remove markdown code blocks if present
        if text.startswith("```"):
            lines = text.split("\n")
            # Remove first and last lines (```json and ```)
            lines = [l for l in lines if not l.strip().startswith("```")]
            text = "\n".join(lines)

        return json.loads(text)

    def _translate_single(
        self,
        text: str,
        width: int,
        height: int,
        font_size: float,
        max_chars: int
    ) -> tuple[str, int]:
        """
        Translate a single text with constraints.

        Returns:
            Tuple of (translated_text, char_count)
        """
        prompt = self.TRANSLATION_PROMPT.format(
            source_lang=self.source_lang,
            target_lang=self.target_lang,
            text=text,
            width=width,
            height=height,
            font_size=font_size,
            max_chars=max_chars
        )

        response = self.model.generate_content(prompt)
        result = self._parse_json_response(response.text)

        return result["translation"], result["char_count"]

    def _shorten_translation(
        self,
        translation: str,
        char_count: int,
        max_chars: int
    ) -> tuple[str, int]:
        """
        Request a shorter version of a translation.

        Returns:
            Tuple of (shortened_text, char_count)
        """
        prompt = self.SHORTEN_PROMPT.format(
            translation=translation,
            char_count=char_count,
            max_chars=max_chars
        )

        response = self.model.generate_content(prompt)
        result = self._parse_json_response(response.text)

        return result["translation"], result["char_count"]

    def translate_shape(self, shape: ShapeData) -> TranslationResult:
        """
        Translate a single shape's text with constraint awareness.

        If the translation is too long:
        1. Log a warning
        2. Request a shortened version

        Args:
            shape: ShapeData with text and bounding box info

        Returns:
            TranslationResult with translation and metadata
        """
        bbox = shape.bounding_box
        max_chars = int(shape.estimated_max_chars * 0.9)  # 90% safety margin

        # First translation attempt
        translated, char_count = self._translate_single(
            text=shape.text,
            width=bbox.width,
            height=bbox.height,
            font_size=shape.primary_font_size_pt,
            max_chars=max_chars
        )

        was_shortened = False
        fits_box = char_count <= max_chars

        # If too long, warn and shorten
        if not fits_box:
            logger.warning(
                f"Translation too long for shape '{shape.shape_name}' "
                f"(slide {shape.slide_index + 1}): "
                f"{char_count} chars > {max_chars} max. Auto-shortening..."
            )

            translated, char_count = self._shorten_translation(
                translation=translated,
                char_count=char_count,
                max_chars=max_chars
            )
            was_shortened = True
            fits_box = char_count <= max_chars

            if fits_box:
                logger.info(f"  -> Shortened to {char_count} chars. Now fits.")
            else:
                logger.warning(
                    f"  -> Still {char_count} chars after shortening. "
                    f"May overflow bounding box."
                )

        return TranslationResult(
            shape_id=shape.shape_id,
            slide_index=shape.slide_index,
            original_text=shape.text,
            translated_text=translated,
            char_count=char_count,
            max_chars=max_chars,
            fits_box=fits_box,
            was_shortened=was_shortened
        )

    def translate_all(self, shapes: list[ShapeData]) -> list[TranslationResult]:
        """
        Translate all shapes in a presentation.

        Args:
            shapes: List of ShapeData from extraction

        Returns:
            List of TranslationResult for each shape
        """
        results = []
        total = len(shapes)

        for i, shape in enumerate(shapes, 1):
            logger.info(f"Translating {i}/{total}: {shape.shape_name}")
            result = self.translate_shape(shape)
            results.append(result)

        return results

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

from google import genai
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
    alternative_short: Optional[str] = None
    confidence: float = 1.0


class Translator:
    """Gemini-powered translator with bounding box constraints"""

    TRANSLATION_PROMPT = """Translate the following text from {source_lang} to {target_lang} with layout constraints.

ORIGINAL TEXT:
{text}

LAYOUT CONSTRAINTS:
- Bounding box: {width}px × {height}px
- Font size: {font_size}pt
- Maximum recommended characters: {max_chars}
- Original character count: {original_char_count}

TRANSLATION RULES:
1. Translation MUST be concise enough to fit the bounding box
2. Prefer concise business English
3. If direct translation exceeds {max_chars} characters, provide a shortened alternative
4. Preserve tone (formal/informal)
5. Keep proper nouns unchanged

Return ONLY valid JSON (no markdown, no code blocks):
{{"translation": "your translation", "char_count": <number>, "fits_box": true, "confidence": 0.95, "alternative_short": null}}"""

    SHORTEN_PROMPT = """The translation "{translation}" is too long ({char_count} chars, max {max_chars}).
Provide a shorter version that preserves the core meaning.

IMPORTANT: Be more concise. Use abbreviations if appropriate. Remove non-essential words.

Return ONLY valid JSON (no markdown, no code blocks):
{{"translation": "shorter version", "char_count": <number>}}"""

    BATCH_PROMPT = """Translate these {source_lang} texts to {target_lang}. Each has bounding box constraints.

TEXTS TO TRANSLATE:
{items_json}

For EACH item, provide a translation that fits within max_chars.
If translation is too long, provide alternative_short.
Prefer concise business English. Preserve tone and keep proper nouns unchanged.

Respond with ONLY a valid JSON array (no markdown, no code blocks):
[
  {{"id": 0, "translation": "...", "char_count": 42, "fits_box": true, "confidence": 0.95, "alternative_short": null}},
  ...
]"""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
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

        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model
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
    ) -> dict:
        """
        Translate a single text with constraints.

        Returns:
            Dict with translation, char_count, fits_box, confidence, alternative_short
        """
        prompt = self.TRANSLATION_PROMPT.format(
            source_lang=self.source_lang,
            target_lang=self.target_lang,
            text=text,
            width=width,
            height=height,
            font_size=font_size,
            max_chars=max_chars,
            original_char_count=len(text)
        )

        response = self.client.models.generate_content(
            model=self.model_name, contents=prompt
        )
        result = self._parse_json_response(response.text)

        return {
            "translation": result["translation"],
            "char_count": result.get("char_count", len(result["translation"])),
            "fits_box": result.get("fits_box", True),
            "confidence": result.get("confidence", 1.0),
            "alternative_short": result.get("alternative_short"),
        }

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

        response = self.client.models.generate_content(
            model=self.model_name, contents=prompt
        )
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
        result = self._translate_single(
            text=shape.text,
            width=bbox.width,
            height=bbox.height,
            font_size=shape.primary_font_size_pt,
            max_chars=max_chars
        )

        translated = result["translation"]
        char_count = result["char_count"]
        confidence = result["confidence"]
        alternative_short = result["alternative_short"]
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
            was_shortened=was_shortened,
            alternative_short=alternative_short,
            confidence=confidence
        )

    def translate_batch(
        self,
        shapes: list[ShapeData],
        batch_size: int = 15
    ) -> list[TranslationResult]:
        """
        Batch translate multiple shapes in one API call for performance.

        Groups up to batch_size shapes per API call, reducing total calls
        by ~85-90% (e.g., 145 shapes = 10 calls instead of 145).

        Falls back to sequential translation if batch parsing fails.

        Args:
            shapes: List of ShapeData from extraction
            batch_size: Max shapes per API call (default 15)

        Returns:
            List of TranslationResult for each shape
        """
        results = []
        total = len(shapes)

        for i in range(0, total, batch_size):
            batch = shapes[i:i + batch_size]
            batch_num = i // batch_size + 1
            total_batches = (total + batch_size - 1) // batch_size
            logger.info(
                f"Translating batch {batch_num}/{total_batches} "
                f"({len(batch)} shapes)"
            )

            # Build batch items
            items = []
            for idx, shape in enumerate(batch):
                bbox = shape.bounding_box
                max_chars = int(shape.estimated_max_chars * 0.9)
                items.append({
                    "id": idx,
                    "shape_id": shape.shape_id,
                    "text": shape.text,
                    "max_chars": max_chars,
                    "box_width_px": bbox.width,
                    "box_height_px": bbox.height,
                    "font_size_pt": shape.primary_font_size_pt,
                })

            prompt = self.BATCH_PROMPT.format(
                source_lang=self.source_lang,
                target_lang=self.target_lang,
                items_json=json.dumps(items, ensure_ascii=False, indent=2)
            )

            try:
                response = self.client.models.generate_content(
            model=self.model_name, contents=prompt
        )
                batch_results = self._parse_json_response(response.text)

                if not isinstance(batch_results, list):
                    raise ValueError("Expected JSON array from batch response")

                for item, shape in zip(batch_results, batch):
                    max_chars = int(shape.estimated_max_chars * 0.9)
                    translation = item["translation"]
                    char_count = item.get("char_count", len(translation))
                    fits_box = item.get("fits_box", char_count <= max_chars)

                    results.append(TranslationResult(
                        shape_id=shape.shape_id,
                        slide_index=shape.slide_index,
                        original_text=shape.text,
                        translated_text=translation,
                        char_count=char_count,
                        max_chars=max_chars,
                        fits_box=fits_box,
                        was_shortened=False,
                        alternative_short=item.get("alternative_short"),
                        confidence=item.get("confidence", 1.0),
                    ))

            except Exception as e:
                logger.warning(
                    f"Batch translation failed: {e}. "
                    f"Falling back to sequential for this batch."
                )
                for shape in batch:
                    results.append(self.translate_shape(shape))

        return results

    def translate_all(
        self,
        shapes: list[ShapeData],
        use_batch: bool = True
    ) -> list[TranslationResult]:
        """
        Translate all shapes in a presentation.

        Args:
            shapes: List of ShapeData from extraction
            use_batch: If True, use batch translation for performance.
                       If False, translate one at a time.

        Returns:
            List of TranslationResult for each shape
        """
        if use_batch and len(shapes) > 1:
            return self.translate_batch(shapes)

        results = []
        total = len(shapes)

        for i, shape in enumerate(shapes, 1):
            logger.info(f"Translating {i}/{total}: {shape.shape_name}")
            result = self.translate_shape(shape)
            results.append(result)

        return results

"""
SlideLink CLI - Command-line interface for translating PowerPoint files

Usage:
    python -m slidelink.cli input.pptx --source ja --target en
    python -m slidelink.cli input.pptx --source ja --target en --output result.pptx
    python -m slidelink.cli input.pptx --source ja --target en --verbose
"""

import argparse
import sys
import logging
from pathlib import Path

from .core.extractor import extract_presentation
from .core.translator import Translator
from .core.reconstructor import reconstruct_presentation


def setup_logging(verbose: bool) -> None:
    """Configure logging based on verbosity"""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(message)s"
    )


def main():
    parser = argparse.ArgumentParser(
        prog="slidelink",
        description="SlideLink - Layout-preserving PowerPoint translation"
    )

    parser.add_argument(
        "input",
        type=str,
        help="Path to input PPTX file"
    )

    parser.add_argument(
        "--source", "-s",
        type=str,
        default="Japanese",
        help="Source language (default: Japanese)"
    )

    parser.add_argument(
        "--target", "-t",
        type=str,
        default="English",
        help="Target language (default: English)"
    )

    parser.add_argument(
        "--output", "-o",
        type=str,
        default=None,
        help="Output file path (default: input_translated.pptx)"
    )

    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose output"
    )

    args = parser.parse_args()

    # Setup logging
    setup_logging(args.verbose)
    logger = logging.getLogger(__name__)

    # Validate input file
    input_path = Path(args.input)
    if not input_path.exists():
        logger.error(f"Error: Input file not found: {args.input}")
        sys.exit(1)

    if not input_path.suffix.lower() == ".pptx":
        logger.error(f"Error: Input must be a .pptx file")
        sys.exit(1)

    # Determine output path
    if args.output:
        output_path = args.output
    else:
        output_path = str(input_path.stem) + "_translated.pptx"

    print("=" * 60)
    print("SlideLink - Layout-Preserving Translation")
    print("=" * 60)
    print(f"Input:  {args.input}")
    print(f"Output: {output_path}")
    print(f"Languages: {args.source} -> {args.target}")
    print()

    # Step 1: Extract
    print("[1/3] Extracting text from presentation...")
    try:
        extraction = extract_presentation(str(input_path))
        print(f"      Found {len(extraction.shapes)} text boxes across {extraction.slide_count} slides")
    except Exception as e:
        logger.error(f"Error extracting: {e}")
        sys.exit(1)

    if not extraction.shapes:
        logger.warning("No text found in presentation. Nothing to translate.")
        sys.exit(0)

    # Step 2: Translate
    print()
    print("[2/3] Translating with Gemini API...")
    try:
        translator = Translator()
        translator.set_languages(args.source, args.target)
        translations = translator.translate_all(extraction.shapes)
    except ValueError as e:
        logger.error(f"Error: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Translation error: {e}")
        sys.exit(1)

    # Summary
    shortened_count = sum(1 for t in translations if t.was_shortened)
    overflow_count = sum(1 for t in translations if not t.fits_box)

    print()
    if shortened_count > 0:
        print(f"      {shortened_count} translation(s) were auto-shortened")
    if overflow_count > 0:
        print(f"      Warning: {overflow_count} translation(s) may overflow their boxes")

    # Step 3: Reconstruct
    print()
    print("[3/3] Reconstructing presentation...")
    try:
        output_file = reconstruct_presentation(
            original_path=str(input_path),
            translations=translations,
            output_path=output_path
        )
        print(f"      Saved to: {output_file}")
    except Exception as e:
        logger.error(f"Reconstruction error: {e}")
        sys.exit(1)

    # Done
    print()
    print("=" * 60)
    print("Done! Translation complete.")
    print("=" * 60)

    if args.verbose:
        print()
        print("Translation Details:")
        print("-" * 60)
        for t in translations:
            status = "[OK]" if t.fits_box else "[OVERFLOW]"
            shortened = " (shortened)" if t.was_shortened else ""
            print(f"\nSlide {t.slide_index + 1}, Shape {t.shape_id}:")
            print(f"  Original:   {t.original_text[:50]}...")
            print(f"  Translated: {t.translated_text[:50]}...")
            print(f"  Status:     {status}{shortened} ({t.char_count}/{t.max_chars} chars)")


if __name__ == "__main__":
    main()

"""
SlideLink Chat Agent - Conversational AI for editing slides with Google Search grounding
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from google import genai
from google.genai.types import GenerateContentConfig, Part, Content, Tool
from dotenv import load_dotenv

from ..models import TranslationPreviewItem

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatAgent:
    """
    Gemini Chat Agent capable of reading the current Slide JSON schema,
    understanding user requests, searching the web, and returning structured JSON actions
    to modify the slide canvas.
    """

    SYSTEM_PROMPT = """You are an expert AI Presentation Assistant.
Your job is to help the user edit and refine their presentation slides.

You have access to the current state of the slides as a JSON array of shapes.
You can reply to the user naturally AND output actions to modify the canvas.

If the user asks a question about the outside world, use the Google Search tool to answer it accurately.

OUTPUT FORMAT REQUIREMENTS:
You MUST respond with a single, valid JSON object exactly matching this structure (no markdown tags):
{
  "message": "Your conversational reply to the user. Keep it brief and helpful.",
  "thinking": [
    "Step 1: I need to do X...",
    "Step 2: Searching the web for Y...",
    "Step 3: Updating the title shape..."
  ],
  "actions": [
    {
      "type": "update_text", // Can be: 'update_text', 'update_style', 'add_shape', 'remove_shape'
      "target_shape_id": 2, // Required for updates/removes
      "slide_index": 0, // Required for all
      "property": "font_color", // Used for update_style
      "value": "#dc2626", // Used for update_style
      "text": "New Text Content", // Used for update_text or add_shape
      "shape_type": "TEXT_BOX", // Used for add_shape
      "bounding_box": {"left": 100, "top": 100, "width": 400, "height": 100} // Used for add_shape
    }
  ]
}

RULES:
1. Always output valid JSON.
2. If the user asks for a simple change (e.g., "Make the title red"), find the title shape_id in the provided context and emit an 'update_style' action.
3. If the user asks to add something, calculate a reasonable bounding_box that doesn't overlap existing shapes on a 960x540 canvas.
4. Keep your 'message' conversational but professional.
"""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        load_dotenv()
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found.")
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model
        
        # Configure Gemini to use Google Search
        self.tools = [Tool(google_search={})]
        self.config = GenerateContentConfig(
            system_instruction=self.SYSTEM_PROMPT,
            temperature=0.4,
            tools=self.tools
        )

    def _parse_json_response(self, text: str) -> dict:
        if not text:
            return {
                "message": "I received an empty response from the AI.",
                "thinking": ["Empty response from Gemini"],
                "actions": []
            }
        text = text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            text = "\n".join(lines)
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Agent JSON: {e}\nRaw Output: {text}")
            return {
                "message": text,
                "thinking": ["Response was not structured JSON"],
                "actions": []
            }

    def chat(self, message: str, chat_history: List[Dict], slide_context: List[dict]) -> Dict:
        """
        Send a message to the agent along with history and current slide state.
        """
        logger.info(f"Agent received message: {message}")

        # Build the structured prompt with conversation history
        context_str = json.dumps(slide_context, indent=2)

        history_str = ""
        if chat_history:
            history_lines = []
            for msg in chat_history[-10:]:  # Keep last 10 messages for context
                role = msg.get("role", "user").upper()
                content = msg.get("content", "")
                history_lines.append(f"{role}: {content}")
            history_str = f"\nCONVERSATION HISTORY:\n" + "\n".join(history_lines) + "\n"

        prompt = f"""
CURRENT SLIDE STATE (JSON Schema):
{context_str}
{history_str}
USER REQUEST:
{message}

Respond ONLY with the required JSON format containing 'message', 'thinking', and 'actions'.
"""
        try:
            # We are recreating a new generation call each time but injecting the history
            # conceptually via the prompt. For a true multi-turn, we'd use client.chats.create()
            # but for structured JSON agentic output, a single large prompt is often more reliable.
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=self.config
            )
            
            # Extract grounding metadata if Google Search was used
            sources = []
            if response.candidates and response.candidates[0].grounding_metadata:
                grounding = response.candidates[0].grounding_metadata
                chunks = getattr(grounding, 'grounding_chunks', None)
                if chunks:
                    for chunk in chunks:
                        if hasattr(chunk, 'web') and chunk.web and hasattr(chunk.web, 'uri'):
                            sources.append({
                                "title": getattr(chunk.web, 'title', 'Web Source'),
                                "url": chunk.web.uri
                            })

            result = self._parse_json_response(response.text or "")
            
            # Add sources to the result if any were found
            if sources:
                result["sources"] = sources
                # Also log search as a thinking step
                if "thinking" not in result:
                    result["thinking"] = []
                result["thinking"].insert(0, f"Performed Google Web Search. Found {len(sources)} sources.")
                
            return result

        except Exception as e:
            logger.error(f"Agent failed: {e}")
            return {
                "message": f"I'm sorry, I encountered a technical error: {str(e)}",
                "thinking": [f"Error: {str(e)}"],
                "actions": []
            }

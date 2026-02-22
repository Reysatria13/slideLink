"""
SlideLink Session Manager - In-memory session storage with auto-cleanup

Stores uploaded files and translation states temporarily.
Sessions expire after 1 hour.
"""

import os
import time
import uuid
import asyncio
import tempfile
import shutil
from typing import Dict, Optional
from threading import Lock

from .models import SessionData, TranslationPreviewItem


class SessionManager:
    """
    In-memory session storage with automatic cleanup.

    Sessions are stored with a UUID and expire after 1 hour.
    """

    EXPIRY_SECONDS = 3600  # 1 hour

    def __init__(self):
        self._sessions: Dict[str, SessionData] = {}
        self._lock = Lock()
        self._temp_dir = tempfile.mkdtemp(prefix="slidelink_")
        self._cleanup_task = None

    def create_session(
        self,
        source_file_path: str,
        source_lang: str,
        target_lang: str,
        slide_count: int
    ) -> str:
        """
        Create a new session.

        Args:
            source_file_path: Path to the uploaded PPTX file
            source_lang: Source language
            target_lang: Target language
            slide_count: Number of slides

        Returns:
            Session ID
        """
        session_id = str(uuid.uuid4())

        session = SessionData(
            session_id=session_id,
            source_file_path=source_file_path,
            source_lang=source_lang,
            target_lang=target_lang,
            slide_count=slide_count,
            created_at=time.time()
        )

        with self._lock:
            self._sessions[session_id] = session

        return session_id

    def get_session(self, session_id: str) -> Optional[SessionData]:
        """Get a session by ID"""
        with self._lock:
            session = self._sessions.get(session_id)
            if session and self._is_expired(session):
                self._cleanup_session(session_id)
                return None
            return session

    def update_translations(
        self,
        session_id: str,
        translations: Dict[str, TranslationPreviewItem]
    ) -> bool:
        """Update translations for a session"""
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return False
            session.translations = translations
            return True

    def update_single_translation(
        self,
        session_id: str,
        shape_key: str,
        translated_text: str
    ) -> bool:
        """Update a single translation"""
        with self._lock:
            session = self._sessions.get(session_id)
            if not session or shape_key not in session.translations:
                return False

            item = session.translations[shape_key]
            item.translated = translated_text
            item.char_count = len(translated_text)
            item.fits_box = item.char_count <= item.max_chars
            return True

    def append_chat(self, session_id: str, role: str, content: str) -> bool:
        """Append a chat message to session history"""
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return False
            session.chat_history.append({"role": role, "content": content})
            return True

    def get_chat_history(self, session_id: str) -> list:
        """Get chat history for a session"""
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return []
            return list(session.chat_history)

    def set_output_path(self, session_id: str, output_path: str) -> bool:
        """Set the output file path after reconstruction"""
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return False
            session.output_file_path = output_path
            return True

    def delete_session(self, session_id: str) -> bool:
        """Delete a session and its files"""
        with self._lock:
            if session_id in self._sessions:
                self._cleanup_session(session_id)
                return True
            return False

    def get_temp_path(self, filename: str) -> str:
        """Get a temporary file path for uploads"""
        return os.path.join(self._temp_dir, f"{uuid.uuid4()}_{filename}")

    def _is_expired(self, session: SessionData) -> bool:
        """Check if a session has expired"""
        return time.time() - session.created_at > self.EXPIRY_SECONDS

    def _cleanup_session(self, session_id: str) -> None:
        """Clean up a session and its files"""
        session = self._sessions.pop(session_id, None)
        if session:
            # Remove source file
            if os.path.exists(session.source_file_path):
                try:
                    os.remove(session.source_file_path)
                except OSError:
                    pass

            # Remove output file if exists
            if session.output_file_path and os.path.exists(session.output_file_path):
                try:
                    os.remove(session.output_file_path)
                except OSError:
                    pass

    def cleanup_expired(self) -> int:
        """Clean up all expired sessions. Returns count of cleaned sessions."""
        cleaned = 0
        with self._lock:
            expired_ids = [
                sid for sid, session in self._sessions.items()
                if self._is_expired(session)
            ]
            for session_id in expired_ids:
                self._cleanup_session(session_id)
                cleaned += 1
        return cleaned

    async def start_cleanup_loop(self, interval: int = 300):
        """Start background cleanup loop (every 5 minutes by default)"""
        while True:
            await asyncio.sleep(interval)
            cleaned = self.cleanup_expired()
            if cleaned > 0:
                print(f"Cleaned up {cleaned} expired session(s)")

    def shutdown(self):
        """Clean up all sessions and temp directory"""
        with self._lock:
            for session_id in list(self._sessions.keys()):
                self._cleanup_session(session_id)

        # Remove temp directory
        if os.path.exists(self._temp_dir):
            shutil.rmtree(self._temp_dir, ignore_errors=True)


# Global session manager instance
session_manager = SessionManager()

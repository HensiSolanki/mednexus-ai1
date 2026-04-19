"""
Whisper ASR — loads once; uses GPU when CUDA is available.
"""

from __future__ import annotations

import logging
import os

import whisper

logger = logging.getLogger(__name__)

_model = None


def get_model():
    global _model
    if _model is None:
        name = os.environ.get("WHISPER_MODEL", "base")
        logger.info("Loading Whisper model: %s", name)
        _model = whisper.load_model(name)
    return _model


def transcribe_file(path: str) -> str:
    model = get_model()
    result = model.transcribe(path)
    return (result.get("text") or "").strip()

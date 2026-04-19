"""
Optional local LLM via Hugging Face transformers (GPU if available).
Set LOCAL_LLM_MODEL to a small instruct model when you have enough VRAM.
"""

from __future__ import annotations

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

_pipe: Any = None


def _build_pipeline():
    import torch
    from transformers import pipeline

    model_id = os.environ.get("LOCAL_LLM_MODEL", "gpt2")
    device = 0 if torch.cuda.is_available() else -1
    torch_dtype = torch.float16 if torch.cuda.is_available() else None

    logger.info("Loading LLM pipeline: %s (cuda=%s)", model_id, torch.cuda.is_available())

    kwargs: dict[str, Any] = {
        "model": model_id,
        "device": device,
    }
    if torch_dtype is not None:
        kwargs["torch_dtype"] = torch_dtype

    return pipeline("text-generation", **kwargs)


def get_pipe():
    global _pipe
    if _pipe is None:
        _pipe = _build_pipeline()
    return _pipe


def generate_text(prompt: str, max_new_tokens: int = 160) -> str:
    pipe = get_pipe()
    tok = pipe.tokenizer
    if getattr(tok, "pad_token", None) is None and getattr(tok, "eos_token", None) is not None:
        tok.pad_token = tok.eos_token
    out = pipe(
        prompt,
        max_new_tokens=max_new_tokens,
        do_sample=True,
        temperature=0.65,
        pad_token_id=tok.pad_token_id,
    )
    if not out:
        return ""
    text = out[0].get("generated_text", "")
    if text.startswith(prompt):
        return text[len(prompt) :].strip()
    return text.strip()

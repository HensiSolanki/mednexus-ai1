"""
MedNexus GPU service: Whisper transcription + optional local LLM.
Run: uvicorn app:app --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import logging
import os
import tempfile
from pathlib import Path

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MedNexus GPU", version="0.1.0")


class GenerateBody(BaseModel):
    prompt: str
    max_new_tokens: int | None = 160


@app.get("/health")
def health():
    return {
        "ok": True,
        "cuda": torch.cuda.is_available(),
        "whisper": os.environ.get("WHISPER_MODEL", "base"),
        "llm": os.environ.get("LOCAL_LLM_MODEL", "gpt2"),
    }


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    from models.whisper_model import transcribe_file

    suffix = Path(file.filename or "clip").suffix or ".webm"
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty upload")

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(data)
        path = tmp.name

    try:
        text = transcribe_file(path)
        return {"text": text}
    except Exception as e:
        logger.exception("transcribe failed")
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


@app.post("/generate")
def generate(body: GenerateBody):
    try:
        from models.llm import generate_text

        text = generate_text(body.prompt, max_new_tokens=body.max_new_tokens or 160)
        return {"text": text}
    except Exception as e:
        logger.exception("generate failed")
        raise HTTPException(status_code=500, detail=str(e)) from e

import os
import json
import httpx
from typing import Dict, Any, List, Optional

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434").rstrip("/")
DEFAULT_MODEL = os.environ.get("MODEL_NAME", "qwen3:4b-instruct")

async def check_ollama_health() -> Dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{OLLAMA_HOST}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                return {
                    "connected": True,
                    "host": OLLAMA_HOST,
                    "model": DEFAULT_MODEL,
                    "installed_models": models
                }
            return {
                "connected": False,
                "host": OLLAMA_HOST,
                "model": DEFAULT_MODEL,
                "error": f"HTTP {resp.status_code}"
            }
    except Exception as e:
        return {
            "connected": False,
            "host": OLLAMA_HOST,
            "model": DEFAULT_MODEL,
            "error": str(e)
        }

async def generate_ollama_completion(prompt: str, model: str = DEFAULT_MODEL) -> Optional[str]:
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2
                }
            }
            resp = await client.post(f"{OLLAMA_HOST}/api/generate", json=payload)
            if resp.status_code == 200:
                return resp.json().get("response", "")
            return None
    except Exception:
        return None

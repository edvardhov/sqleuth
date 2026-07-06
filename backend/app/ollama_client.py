"""Ollama integration for narration and text-to-SQL."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import httpx

from app.config import settings
from app.query_translator import TRANSLATE_FALLBACK_SQL, translate_question_to_sql

CASE_PATH = Path(__file__).resolve().parent.parent / "data" / "case.json"

NOIR_SYSTEM_PROMPT = """You are Detective Jack Marlowe, a hard-boiled 1940s LA private investigator.
You speak in terse, atmospheric noir prose — short sentences, cigarette smoke, rain on asphalt.
Never break character. Never mention AI, databases, or SQL.
React to the query results as if you're examining case evidence on your desk.
Keep responses under 120 words."""


async def generate(prompt: str, system: str | None = None) -> str:
    payload: dict[str, Any] = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
    }
    if system:
        payload["system"] = system

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(f"{settings.ollama_url}/api/generate", json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "").strip()
    except (httpx.HTTPError, KeyError):
        return ""


def load_case() -> dict[str, Any]:
    with CASE_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


async def narrate_query(query: str, columns: list[str], rows: list[list[Any]]) -> str:
    preview_rows = rows[:8]
    prompt = (
        f"The detective ran this query: {query}\n"
        f"Columns: {', '.join(columns) if columns else 'none'}\n"
        f"Results ({len(rows)} rows): {json.dumps(preview_rows)}\n"
        "Describe what these results reveal about the Marlowe murder case."
    )
    result = await generate(prompt, system=NOIR_SYSTEM_PROMPT)
    if result:
        return result

    if not rows:
        return (
            "Empty result set. Either you're chasing a ghost, "
            "or your query's tighter than a snitch's lips. Try another angle."
        )

    return (
        f"{len(rows)} rows came back from the files. "
        "The pattern's in there somewhere — follow the thread, don't let it go cold."
    )


async def translate_to_sql(question: str, schema: list[dict[str, Any]]) -> str:
    ruled = translate_question_to_sql(question)
    if ruled:
        return ruled

    case = load_case()
    schema_text = json.dumps(schema, indent=2)
    prompt = (
        "Convert the following natural language question into a single SQLite SELECT query.\n"
        "Return ONLY the SQL statement — no explanation, no markdown fences.\n\n"
        f"Case context: The victim is {case['victim']}. "
        f"Crime date: {case['date']}. Location: {case['location']}.\n"
        "The victim is NOT in the suspects table — use crime_scene_reports for victim info.\n\n"
        f"Schema:\n{schema_text}\n\n"
        f"Question: {question}"
    )
    result = await generate(prompt)
    if not result:
        return TRANSLATE_FALLBACK_SQL

    cleaned = result.strip()
    if cleaned.startswith("```"):
        lines = [line for line in cleaned.splitlines() if not line.strip().startswith("```")]
        cleaned = "\n".join(lines).strip()
    return cleaned

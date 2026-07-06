"""Schema, case, narration, translation, and solve routes."""

from __future__ import annotations

import sqlite3
from typing import Any

from fastapi import APIRouter

from app.config import settings
from app.models import (
    NarrateRequest,
    NarrateResponse,
    SolveRequest,
    SolveResponse,
    TranslateRequest,
    TranslateResponse,
)
from app.ollama_client import load_case, narrate_query, translate_to_sql

router = APIRouter(prefix="/api", tags=["game"])


def _fetch_schema() -> list[dict[str, Any]]:
    conn = sqlite3.connect(settings.database_uri, uri=True)
    try:
        cursor = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        )
        tables: dict[str, list[dict[str, str]]] = {}
        for (table_name,) in cursor.fetchall():
            col_cursor = conn.execute(f"PRAGMA table_info({table_name})")
            tables[table_name] = [
                {"name": row[1], "type": row[2]} for row in col_cursor.fetchall()
            ]
        return [{"table": name, "columns": columns} for name, columns in tables.items()]
    finally:
        conn.close()


@router.get("/schema")
def get_schema() -> list[dict[str, Any]]:
    return _fetch_schema()


@router.get("/case")
def get_case() -> dict[str, Any]:
    case = load_case()
    return {
        "title": case["title"],
        "subtitle": case["subtitle"],
        "briefing": case["briefing"],
        "victim": case["victim"],
        "location": case["location"],
        "date": case["date"],
        "hints": case["hints"],
    }


@router.post("/narrate", response_model=NarrateResponse)
async def narrate(payload: NarrateRequest) -> NarrateResponse:
    narration = await narrate_query(payload.query, payload.columns, payload.rows)
    return NarrateResponse(narration=narration)


@router.post("/translate", response_model=TranslateResponse)
async def translate(payload: TranslateRequest) -> TranslateResponse:
    schema = _fetch_schema()
    sql = await translate_to_sql(payload.question, schema)
    return TranslateResponse(sql=sql)


@router.post("/solve", response_model=SolveResponse)
def solve(payload: SolveRequest) -> SolveResponse:
    case = load_case()
    killer_id = case["killer_id"]
    correct = payload.suspect_id == killer_id

    return SolveResponse(
        correct=correct,
        epilogue=case["win_epilogue"] if correct else case["lose_epilogue"],
        killer_name=case["killer_name"] if correct else None,
    )

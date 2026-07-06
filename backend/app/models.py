"""Pydantic request/response models."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    sql: str = Field(..., min_length=1)


class QueryResponse(BaseModel):
    columns: list[str]
    rows: list[list[Any]]
    row_count: int
    truncated: bool = False
    error: Optional[str] = None


class NarrateRequest(BaseModel):
    query: str
    columns: list[str] = Field(default_factory=list)
    rows: list[list[Any]] = Field(default_factory=list)


class NarrateResponse(BaseModel):
    narration: str


class TranslateRequest(BaseModel):
    question: str = Field(..., min_length=1)


class TranslateResponse(BaseModel):
    sql: str


class SolveRequest(BaseModel):
    suspect_id: int


class SolveResponse(BaseModel):
    correct: bool
    epilogue: str
    killer_name: Optional[str] = None

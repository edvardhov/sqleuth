"""Safe SQL query execution against SQLite."""

from __future__ import annotations

import re
import sqlite3
from typing import Any

from app.config import settings

FORBIDDEN_KEYWORDS = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|ATTACH|DETACH|PRAGMA|VACUUM|REINDEX)\b",
    re.IGNORECASE,
)


class QueryValidationError(ValueError):
    pass


def validate_query(sql: str) -> str:
    cleaned = sql.strip().rstrip(";")
    if not cleaned:
        raise QueryValidationError("Query cannot be empty.")

    if not sqlite3.complete_statement(cleaned + ";"):
        raise QueryValidationError("Incomplete or malformed SQL statement.")

    if ";" in cleaned:
        raise QueryValidationError("Only a single SQL statement is allowed.")

    if FORBIDDEN_KEYWORDS.search(cleaned):
        raise QueryValidationError("Only SELECT queries are permitted.")

    normalized = cleaned.lstrip().upper()
    if not (normalized.startswith("SELECT") or normalized.startswith("WITH")):
        raise QueryValidationError("Only SELECT queries are permitted.")

    return cleaned


def execute_query(sql: str) -> dict[str, Any]:
    validated = validate_query(sql)
    conn = sqlite3.connect(settings.database_uri, uri=True)
    conn.row_factory = sqlite3.Row

    try:
        conn.set_progress_handler(_timeout_handler, settings.query_timeout_ms)
        cursor = conn.execute(validated)
        rows = cursor.fetchmany(settings.query_row_limit + 1)
        truncated = len(rows) > settings.query_row_limit
        if truncated:
            rows = rows[: settings.query_row_limit]

        columns = [description[0] for description in cursor.description] if cursor.description else []
        serialized_rows = [list(row) for row in rows]

        return {
            "columns": columns,
            "rows": serialized_rows,
            "row_count": len(serialized_rows),
            "truncated": truncated,
        }
    finally:
        conn.set_progress_handler(None, 0)
        conn.close()


def _timeout_handler() -> int:
    raise sqlite3.OperationalError("Query exceeded time limit.")

"""Query execution routes."""

import sqlite3

from fastapi import APIRouter

from app.models import QueryRequest, QueryResponse
from app.sql_executor import QueryValidationError, execute_query

router = APIRouter(prefix="/api", tags=["query"])


@router.post("/query", response_model=QueryResponse)
def run_query(payload: QueryRequest) -> QueryResponse:
    try:
        result = execute_query(payload.sql)
        return QueryResponse(**result)
    except QueryValidationError as exc:
        return QueryResponse(columns=[], rows=[], row_count=0, error=str(exc))
    except sqlite3.Error as exc:
        return QueryResponse(columns=[], rows=[], row_count=0, error=str(exc))

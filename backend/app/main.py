"""SQLeuth FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import game, query

app = FastAPI(title="SQLeuth API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query.router)
app.include_router(game.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

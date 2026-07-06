"""Application configuration."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"
    database_path: str = "./data/sqleuth.db"
    cors_origins: str = "http://localhost:3000"
    query_row_limit: int = 200
    query_timeout_ms: int = 2000

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def database_uri(self) -> str:
        path = Path(self.database_path).resolve()
        return f"file:{path}?mode=ro"


settings = Settings()

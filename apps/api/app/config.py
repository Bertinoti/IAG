from functools import lru_cache
import os

from pydantic import BaseModel, Field


class Settings(BaseModel):
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000, ge=1, le=65535)
    database_url: str = "sqlite:///./data/airline.db"
    session_secret: str = "local-development-secret"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    input_price_per_token: float = 0.00000015
    output_price_per_token: float = 0.0000006
    admin_email: str = "admin@example.com"
    admin_password: str = "ChangeMe123!"
    session_cookie_name: str = "airline_admin_session"
    session_max_age: int = Field(default=3600, ge=60, le=86400)
    cookie_secure: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings(
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", "8000")),
        database_url=os.getenv("DATABASE_URL", "sqlite:///./data/airline.db"),
        session_secret=os.getenv("SESSION_SECRET", "local-development-secret"),
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        openai_model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        input_price_per_token=float(os.getenv("INPUT_PRICE_PER_TOKEN", "0.00000015")),
        output_price_per_token=float(os.getenv("OUTPUT_PRICE_PER_TOKEN", "0.0000006")),
        admin_email=os.getenv("ADMIN_EMAIL", "admin@example.com"),
        admin_password=os.getenv("ADMIN_PASSWORD", "ChangeMe123!"),
        session_cookie_name=os.getenv("SESSION_COOKIE_NAME", "airline_admin_session"),
        session_max_age=int(os.getenv("SESSION_MAX_AGE", "3600")),
        cookie_secure=os.getenv("COOKIE_SECURE", "false").lower() == "true",
    )

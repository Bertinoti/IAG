from contextlib import asynccontextmanager
import logging
import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import get_current_admin, seed_admin
from .models import User
from .routers import agent_config, airline_config, auth, catalog, conversations, dashboard


def configure_logging() -> None:
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        logger = logging.getLogger(name)
        for handler in logger.handlers:
            handler.setFormatter(formatter)


configure_logging()


@asynccontextmanager
async def lifespan(_: FastAPI):
    seed_admin()
    yield


app = FastAPI(title="Airline AI Agent API", version="0.1.0", lifespan=lifespan)
cors_origins = [origin.strip().rstrip("/") for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,https://7dqj4wzr-8000.uks1.devtunnels.ms").split(",") if origin.strip()]
app.add_middleware(CORSMiddleware, allow_origins=cors_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router)
app.include_router(catalog.router)
app.include_router(agent_config.router)
app.include_router(airline_config.router)
app.include_router(conversations.router)
app.include_router(dashboard.router)

@app.get("/api/admin/protected", tags=["authentication"])
def protected(_: User = Depends(get_current_admin)) -> dict[str, object]:
    return {"ok": True}

@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import get_current_admin, seed_admin
from .models import User
from .routers import agent_config, airline_config, auth, catalog, conversations, dashboard


@asynccontextmanager
async def lifespan(_: FastAPI):
    seed_admin()
    yield


app = FastAPI(title="Airline AI Agent API", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

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

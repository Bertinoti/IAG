from fastapi import Depends, FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import create_session, get_current_admin, seed_admin, verify_password
from .config import get_settings
from .database import get_db
from .models import User

settings = get_settings()
app = FastAPI(title="Airline AI Agent API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
def startup() -> None:
    seed_admin()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


def admin_response(user: User) -> dict[str, object]:
    return {"id": user.id, "email": user.email, "role": user.role}


@app.post("/api/auth/login", tags=["authentication"])
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> dict[str, object]:
    user = db.scalar(select(User).where(User.email == payload.email.lower(), User.role == "admin"))
    if user is None or not verify_password(payload.password, user.password_hash):
        return Response(content='{"code":"invalid_credentials","message":"Invalid email or password"}', status_code=401, media_type="application/json")
    settings = get_settings()
    response.set_cookie(settings.session_cookie_name, create_session(user.id), max_age=settings.session_max_age, httponly=True, secure=settings.cookie_secure, samesite="lax", path="/")
    return {"admin": admin_response(user)}


@app.post("/api/auth/logout", tags=["authentication"])
def logout(response: Response) -> dict[str, bool]:
    response.delete_cookie(get_settings().session_cookie_name, path="/")
    return {"success": True}


@app.get("/api/auth/session", tags=["authentication"])
def session(admin: User = Depends(get_current_admin)) -> dict[str, object]:
    return {"authenticated": True, "admin": admin_response(admin)}


@app.get("/api/admin/protected", tags=["authentication"])
def protected(admin: User = Depends(get_current_admin)) -> dict[str, object]:
    return {"ok": True, "admin": admin_response(admin)}


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}

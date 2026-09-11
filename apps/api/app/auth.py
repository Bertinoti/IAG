import base64
import hashlib
import hmac
import secrets
import time

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import get_settings
from .database import get_db
from .models import User


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        _, salt_text, digest_text = encoded.split("$", 2)
        salt = base64.urlsafe_b64decode(salt_text.encode())
        expected = base64.urlsafe_b64decode(digest_text.encode())
        actual = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def _signature(payload: str) -> str:
    return hmac.new(get_settings().session_secret.encode(), payload.encode(), hashlib.sha256).hexdigest()


def create_session(user_id: int, max_age: int | None = None) -> str:
    expiry = int(time.time()) + (max_age if max_age is not None else get_settings().session_max_age)
    payload = f"{user_id}:{expiry}"
    return f"{payload}.{_signature(payload)}"


def read_session(value: str | None) -> int | None:
    if not value or "." not in value:
        return None
    payload, signature = value.rsplit(".", 1)
    if not hmac.compare_digest(_signature(payload), signature):
        return None
    try:
        user_id_text, expiry_text = payload.split(":", 1)
        if int(expiry_text) <= int(time.time()):
            return None
        return int(user_id_text)
    except ValueError:
        return None


def get_current_admin(
    session_cookie: str | None = Cookie(default=None, alias=get_settings().session_cookie_name),
    db: Session = Depends(get_db),
) -> User:
    user_id = read_session(session_cookie)
    user = db.scalar(select(User).where(User.id == user_id, User.role == "admin")) if user_id else None
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user


def seed_admin() -> None:
    from .database import Base, engine, SessionLocal

    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        email = get_settings().admin_email.strip().lower()
        if db.scalar(select(User).where(User.email == email)) is None:
            db.add(User(email=email, password_hash=hash_password(get_settings().admin_password), role="admin"))
            db.commit()

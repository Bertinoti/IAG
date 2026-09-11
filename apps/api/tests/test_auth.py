from fastapi.testclient import TestClient

from app.auth import create_session
from app.config import get_settings
from app.main import app


def test_login_protects_and_logout_clears_session() -> None:
    with TestClient(app) as client:
        denied = client.get("/api/admin/protected")
        assert denied.status_code == 401
        logged_in = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "ChangeMe123!"})
        assert logged_in.status_code == 200
        assert logged_in.json()["admin"]["role"] == "admin"
        assert get_settings().session_cookie_name in logged_in.cookies
        assert client.get("/api/admin/protected").status_code == 200
        assert client.post("/api/auth/logout").json() == {"success": True}
        assert client.get("/api/admin/protected").status_code == 401


def test_invalid_credentials_are_rejected() -> None:
    with TestClient(app) as client:
        response = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "wrong"})
        assert response.status_code == 401
        assert response.json()["code"] == "invalid_credentials"


def test_expired_session_is_rejected() -> None:
    with TestClient(app) as client:
        client.cookies.set(get_settings().session_cookie_name, create_session(1, max_age=-1))
        assert client.get("/api/admin/protected").status_code == 401


def test_login_validation_is_safe() -> None:
    with TestClient(app) as client:
        response = client.post("/api/auth/login", json={"email": "not-an-email", "password": ""})
        assert response.status_code == 422

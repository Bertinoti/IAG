from fastapi.testclient import TestClient

from app.auth import create_session
from app.config import get_settings
from app.main import app
from app.agent import AIResult
from app.routers.conversations import get_ai_provider

class FakeProvider:
    def complete(self, prompt: str) -> AIResult:
        return AIResult("Test response", 3, 2)


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


def test_public_chat_resources_do_not_require_admin_session() -> None:
    app.dependency_overrides[get_ai_provider] = lambda: FakeProvider()
    with TestClient(app) as client:
        airlines = client.get("/api/airlines")
        intents = client.get("/api/intents")
        assert airlines.status_code == 200
        assert intents.status_code == 200
        conversation = client.post("/api/conversations", json={"airline_id": airlines.json()["items"][0]["id"], "intent_id": intents.json()["items"][0]["id"]})
        assert conversation.status_code == 200
        sent = client.post(f"/api/conversations/{conversation.json()['id']}/messages", json={"content": "What is the baggage allowance?"})
        assert sent.status_code == 200
        rated = client.put(f"/api/conversations/{conversation.json()['id']}/rating", json={"rating": "positive"})
        assert rated.status_code == 200
        assert client.get("/api/conversations").status_code == 401
        assert client.get("/api/dashboard").status_code == 401
    app.dependency_overrides.clear()

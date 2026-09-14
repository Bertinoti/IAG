from fastapi.testclient import TestClient
from app.main import app
from app.routers.conversations import get_ai_provider
from app.agent import AIResult

class FakeProvider:
    def complete(self, prompt: str) -> AIResult: return AIResult("Mocked answer", 10, 5)

def admin_client() -> TestClient:
    client = TestClient(app); client.post("/api/auth/login", json={"email": "admin@example.com", "password": "ChangeMe123!"}); return client

def test_configuration_and_dashboard_aggregates() -> None:
    app.dependency_overrides[get_ai_provider] = lambda: FakeProvider()
    with admin_client() as client:
        saved = client.put("/api/agent-config", json={"context":"Airline support","guardrails":"Be concise","content":"Policies","language":"English"})
        assert saved.status_code == 200 and saved.json()["context"] == "Airline support"
        catalog = client.get("/api/airlines").json(); intents = client.get("/api/intents").json()
        conversation = client.post("/api/conversations", json={"airline_id": catalog["items"][0]["id"], "intent_id": intents["items"][0]["id"]}).json()
        sent = client.post(f"/api/conversations/{conversation['id']}/messages", json={"content":"Question"})
        assert sent.status_code == 200 and sent.json()["assistant_message"]["total_tokens"] == 15
        client.put(f"/api/conversations/{conversation['id']}/rating", json={"rating":"positive"})
        dashboard = client.get("/api/dashboard?range=all").json()
        assert dashboard["kpis"]["total_conversations"] >= 1
        assert dashboard["conversations_by_airline"]
        assert dashboard["language_distribution"]
    app.dependency_overrides.clear()

def test_airline_prompt_configuration_is_protected_and_persisted() -> None:
    with TestClient(app) as public:
        assert public.get("/api/airline-config").status_code == 401
    with admin_client() as client:
        airline_id = client.get("/api/airlines").json()["items"][0]["id"]
        saved = client.put(f"/api/airline-config/{airline_id}", json={"context": "Brand context", "guardrails": "Stay factual", "content": "Airline policies", "language": "English"})
        assert saved.status_code == 200
        assert saved.json()["configuration"]["context"] == "Brand context"
        listed = client.get("/api/airline-config").json()
        assert any(item["configuration"]["context"] == "Brand context" for item in listed["items"])

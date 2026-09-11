from datetime import datetime, timedelta
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .auth import create_session, get_current_admin, seed_admin, verify_password
from .config import get_settings
from .database import get_db
from .models import AgentConfiguration, Airline, Conversation, ConversationRating, Intent, Message, User
from .agent import OpenAIProvider, PromptBuilder

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

class ConfigPayload(BaseModel):
    context: str = Field(max_length=10000); guardrails: str = Field(max_length=10000); content: str = Field(max_length=10000); language: str = Field(min_length=1, max_length=50)
class ConversationPayload(BaseModel): airline_id: int; intent_id: int
class MessagePayload(BaseModel): content: str = Field(min_length=1, max_length=4000)
class RatingPayload(BaseModel): rating: str = Field(pattern="^(positive|negative)$")

def config_out(c: AgentConfiguration) -> dict[str, object]: return {"id": c.id, "context": c.context, "guardrails": c.guardrails, "content": c.content, "language": c.language, "created_at": c.created_at, "updated_at": c.updated_at}
def message_out(m: Message) -> dict[str, object]: return {"id": m.id, "conversation_id": m.conversation_id, "role": m.role, "content": m.content, "input_tokens": m.input_tokens, "output_tokens": m.output_tokens, "total_tokens": m.total_tokens, "estimated_cost": m.estimated_cost, "created_at": m.created_at}

@app.get("/api/agent-config")
def get_config(_: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    c = db.scalar(select(AgentConfiguration).order_by(AgentConfiguration.id))
    if c is None: c = AgentConfiguration(); db.add(c); db.commit(); db.refresh(c)
    return config_out(c)

@app.put("/api/agent-config")
def put_config(payload: ConfigPayload, _: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    c = db.scalar(select(AgentConfiguration).order_by(AgentConfiguration.id)) or AgentConfiguration(); c.context, c.guardrails, c.content, c.language = payload.context, payload.guardrails, payload.content, payload.language; db.add(c); db.commit(); db.refresh(c); return config_out(c)

@app.get("/api/airlines")
def airlines(_: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]: return {"items": [{"id": a.id, "name": a.name, "code": a.code, "created_at": a.created_at} for a in db.scalars(select(Airline).order_by(Airline.name))]}
@app.get("/api/intents")
def intents(_: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]: return {"items": [{"id": i.id, "name": i.name, "created_at": i.created_at} for i in db.scalars(select(Intent).order_by(Intent.id))]}

@app.post("/api/conversations")
def create_conversation(payload: ConversationPayload, _: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    if not db.get(Airline, payload.airline_id) or not db.get(Intent, payload.intent_id): raise HTTPException(422, "Invalid airline or intent")
    c = Conversation(airline_id=payload.airline_id, intent_id=payload.intent_id); db.add(c); db.commit(); db.refresh(c); return {"id": c.id, "airline_id": c.airline_id, "intent_id": c.intent_id, "started_at": c.started_at, "updated_at": c.updated_at}

@app.post("/api/conversations/{conversation_id}/messages")
def send_message(conversation_id: int, payload: MessagePayload, _: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    c = db.get(Conversation, conversation_id)
    if not c: raise HTTPException(404, "Conversation not found")
    config = db.scalar(select(AgentConfiguration).order_by(AgentConfiguration.id)) or AgentConfiguration()
    airline, intent = db.get(Airline, c.airline_id), db.get(Intent, c.intent_id)
    prompt = PromptBuilder().build(config.context, config.guardrails, config.content, config.language, airline.name, intent.name, payload.content)
    result = OpenAIProvider().complete(prompt)
    user_msg = Message(conversation_id=c.id, role="user", content=payload.content)
    assistant_msg = Message(conversation_id=c.id, role="assistant", content=result.content, input_tokens=result.input_tokens, output_tokens=result.output_tokens, total_tokens=result.input_tokens + result.output_tokens, estimated_cost=(result.input_tokens + result.output_tokens) * 0.000001)
    db.add_all([user_msg, assistant_msg]); db.commit(); db.refresh(user_msg); db.refresh(assistant_msg); return {"user_message": message_out(user_msg), "assistant_message": message_out(assistant_msg)}

@app.get("/api/conversations")
def list_conversations(page: int = 1, page_size: int = 20, _: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    page_size = min(max(page_size, 1), 100); total = db.scalar(select(func.count(Conversation.id))) or 0; items = db.scalars(select(Conversation).order_by(Conversation.updated_at.desc()).offset((page-1)*page_size).limit(page_size)).all(); return {"items": [{"id": c.id, "airline_id": c.airline_id, "intent_id": c.intent_id, "started_at": c.started_at, "updated_at": c.updated_at, "message_count": db.scalar(select(func.count(Message.id)).where(Message.conversation_id == c.id)) or 0} for c in items], "page": page, "page_size": page_size, "total": total}

@app.get("/api/conversations/{conversation_id}")
def conversation_detail(conversation_id: int, _: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    c = db.get(Conversation, conversation_id)
    if not c: raise HTTPException(404, "Conversation not found")
    rating = db.scalar(select(ConversationRating).where(ConversationRating.conversation_id == c.id)); msgs = db.scalars(select(Message).where(Message.conversation_id == c.id).order_by(Message.created_at)).all(); return {"conversation": {"id": c.id, "airline_id": c.airline_id, "intent_id": c.intent_id, "started_at": c.started_at, "updated_at": c.updated_at}, "messages": [message_out(m) for m in msgs], "rating": rating.rating if rating else None}

@app.put("/api/conversations/{conversation_id}/rating")
def rate(conversation_id: int, payload: RatingPayload, _: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    if not db.get(Conversation, conversation_id): raise HTTPException(404, "Conversation not found")
    r = db.scalar(select(ConversationRating).where(ConversationRating.conversation_id == conversation_id)) or ConversationRating(conversation_id=conversation_id); r.rating = payload.rating; db.add(r); db.commit(); db.refresh(r); return {"id": r.id, "conversation_id": r.conversation_id, "rating": r.rating, "created_at": r.created_at}

@app.get("/api/dashboard")
def dashboard(range: str = "all", _: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    since = datetime.utcnow() - timedelta(days=7 if range == "7d" else 30) if range in {"7d", "30d"} else None; conv_q = select(Conversation); msg_q = select(Message)
    if since: conv_q = conv_q.where(Conversation.started_at >= since); msg_q = msg_q.where(Message.created_at >= since)
    conversations = db.scalars(conv_q).all(); messages = db.scalars(msg_q).all(); ratings = db.scalars(select(ConversationRating)).all(); total_tokens = sum(m.total_tokens or 0 for m in messages); positive = sum(r.rating == "positive" for r in ratings)
    return {"kpis": {"total_conversations": len(conversations), "total_messages": len(messages), "average_messages_per_conversation": len(messages)/len(conversations) if conversations else 0, "positive_rating_percentage": positive/len(ratings)*100 if ratings else 0, "total_tokens": total_tokens, "estimated_ai_cost": sum(m.estimated_cost or 0 for m in messages)}, "conversations_over_time": [], "conversations_by_airline": [], "intent_distribution": [], "feedback_distribution": []}


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}

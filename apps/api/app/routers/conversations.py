from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from ..agent import AIProvider, OpenAIProvider, ProviderError
from ..auth import get_current_admin
from ..database import get_db
from ..models import Airline, Conversation, ConversationRating, Intent, Message, User
from ..schemas import ConversationPayload, MessagePayload, RatingPayload
from ..services import ConversationService
router = APIRouter(prefix="/api/conversations", tags=["conversations"])
def get_ai_provider() -> AIProvider: return OpenAIProvider()
def message_out(m: Message) -> dict[str, object]: return {"id": m.id, "conversation_id": m.conversation_id, "role": m.role, "content": m.content, "input_tokens": m.input_tokens, "output_tokens": m.output_tokens, "total_tokens": m.total_tokens, "estimated_cost": m.estimated_cost, "created_at": m.created_at}
@router.post("")
def create_conversation(payload: ConversationPayload, db: Session = Depends(get_db)) -> dict[str, object]:
    if not db.get(Airline, payload.airline_id) or not db.get(Intent, payload.intent_id): raise HTTPException(422, "Invalid airline or intent")
    c = Conversation(airline_id=payload.airline_id, intent_id=payload.intent_id); db.add(c); db.commit(); db.refresh(c); return {"id": c.id, "airline_id": c.airline_id, "intent_id": c.intent_id, "started_at": c.started_at, "updated_at": c.updated_at}
@router.post("/{conversation_id}/messages")
def send_message(conversation_id: int, payload: MessagePayload, db: Session = Depends(get_db), provider: AIProvider = Depends(get_ai_provider)) -> dict[str, object]:
    c = db.get(Conversation, conversation_id)
    if not c: raise HTTPException(404, "Conversation not found")
    airline, intent = db.get(Airline, c.airline_id), db.get(Intent, c.intent_id)
    try: user_msg, assistant_msg = ConversationService(provider).respond(db, c, payload.content, airline.name, intent.name)
    except ProviderError: raise HTTPException(503, "AI provider unavailable")
    return {"user_message": message_out(user_msg), "assistant_message": message_out(assistant_msg)}
@router.get("")
def list_conversations(page: int = 1, page_size: int = 20, airline_id: int | None = None, intent_id: int | None = None, language: str | None = None, _: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    page_size = min(max(page_size, 1), 100)
    filters = []
    if airline_id is not None: filters.append(Conversation.airline_id == airline_id)
    if intent_id is not None: filters.append(Conversation.intent_id == intent_id)
    if language: filters.append(Conversation.language == language)
    base = select(Conversation).where(*filters)
    total = db.scalar(select(func.count(Conversation.id)).where(*filters)) or 0
    items = db.scalars(base.order_by(Conversation.updated_at.desc()).offset((page - 1) * page_size).limit(page_size)).all()
    airlines = {a.id: a for a in db.scalars(select(Airline)).all()}; intents = {i.id: i for i in db.scalars(select(Intent)).all()}
    return {"items": [{"id": c.id, "airline_id": c.airline_id, "airline_code": airlines[c.airline_id].code if c.airline_id in airlines else "", "airline_name": airlines[c.airline_id].name if c.airline_id in airlines else "", "intent_id": c.intent_id, "intent_name": intents[c.intent_id].name if c.intent_id in intents else "", "language": c.language, "started_at": c.started_at, "updated_at": c.updated_at, "message_count": db.scalar(select(func.count(Message.id)).where(Message.conversation_id == c.id)) or 0} for c in items], "page": page, "page_size": page_size, "total": total}
@router.get("/{conversation_id}")
def conversation_detail(conversation_id: int, _: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    c = db.get(Conversation, conversation_id)
    if not c: raise HTTPException(404, "Conversation not found")
    rating = db.scalar(select(ConversationRating).where(ConversationRating.conversation_id == c.id)); msgs = db.scalars(select(Message).where(Message.conversation_id == c.id).order_by(Message.created_at)).all(); return {"conversation": {"id": c.id, "airline_id": c.airline_id, "intent_id": c.intent_id, "started_at": c.started_at, "updated_at": c.updated_at}, "messages": [message_out(m) for m in msgs], "rating": rating.rating if rating else None}
@router.put("/{conversation_id}/rating")
def rate(conversation_id: int, payload: RatingPayload, db: Session = Depends(get_db)) -> dict[str, object]:
    if not db.get(Conversation, conversation_id): raise HTTPException(404, "Conversation not found")
    r = db.scalar(select(ConversationRating).where(ConversationRating.conversation_id == conversation_id)) or ConversationRating(conversation_id=conversation_id); r.rating = payload.rating; db.add(r); db.commit(); db.refresh(r); return {"id": r.id, "conversation_id": r.conversation_id, "rating": r.rating, "created_at": r.created_at}

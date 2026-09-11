from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from ..auth import get_current_admin
from ..database import get_db
from ..models import Airline, Conversation, ConversationRating, Intent, Message, User
router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
@router.get("")
def dashboard(range: str = "all", _: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    since = datetime.utcnow() - timedelta(days=7 if range == "7d" else 30) if range in {"7d", "30d"} else None; cq, mq = select(Conversation), select(Message)
    if since: cq, mq = cq.where(Conversation.started_at >= since), mq.where(Message.created_at >= since)
    conversations, messages = db.scalars(cq).all(), db.scalars(mq).all(); ratings = db.scalars(select(ConversationRating).where(ConversationRating.conversation_id.in_([c.id for c in conversations]))).all() if conversations else []; total_tokens = sum(m.total_tokens or 0 for m in messages); positive = sum(r.rating == "positive" for r in ratings)
    by_airline = db.execute(select(Conversation.airline_id, func.count(Conversation.id)).where(Conversation.id.in_([c.id for c in conversations])).group_by(Conversation.airline_id)).all() if conversations else []
    by_intent = db.execute(select(Conversation.intent_id, func.count(Conversation.id)).where(Conversation.id.in_([c.id for c in conversations])).group_by(Conversation.intent_id)).all() if conversations else []
    airline_names = {a.id: a.name for a in db.scalars(select(Airline)).all()}; intent_names = {i.id: i.name for i in db.scalars(select(Intent)).all()}
    return {"kpis": {"total_conversations": len(conversations), "total_messages": len(messages), "average_messages_per_conversation": len(messages)/len(conversations) if conversations else 0, "positive_rating_percentage": positive/len(ratings)*100 if ratings else 0, "total_tokens": total_tokens, "estimated_ai_cost": sum(m.estimated_cost or 0 for m in messages)}, "conversations_over_time": [], "conversations_by_airline": [{"label": airline_names.get(i, str(i)), "value": n} for i, n in by_airline], "intent_distribution": [{"label": intent_names.get(i, str(i)), "value": n} for i, n in by_intent], "feedback_distribution": [{"label": "positive", "value": sum(r.rating == "positive" for r in ratings)}, {"label": "negative", "value": sum(r.rating == "negative" for r in ratings)}]}

from sqlalchemy import select
from sqlalchemy.orm import Session
from .models import AgentConfiguration, Airline, Conversation, Intent

class AgentConfigurationRepository:
    def get_active(self, db: Session) -> AgentConfiguration:
        config = db.scalar(select(AgentConfiguration).order_by(AgentConfiguration.id))
        if config is None:
            config = AgentConfiguration(); db.add(config); db.commit(); db.refresh(config)
        return config

class CatalogRepository:
    def airlines(self, db: Session): return db.scalars(select(Airline).order_by(Airline.name)).all()
    def intents(self, db: Session): return db.scalars(select(Intent).order_by(Intent.id)).all()
    def valid_selection(self, db: Session, airline_id: int, intent_id: int) -> bool: return bool(db.get(Airline, airline_id) and db.get(Intent, intent_id))

class ConversationRepository:
    def get(self, db: Session, conversation_id: int): return db.get(Conversation, conversation_id)

import unicodedata

from sqlalchemy import select

from .agent import AIProvider, PromptBuilder
from .models import AirlinePromptConfiguration, Conversation, Message
from .repositories import AgentConfigurationRepository, ConversationRepository
from .config import get_settings


def detect_language(message: str) -> str:
    lowered = unicodedata.normalize("NFKD", message.lower()).encode("ascii", "ignore").decode()
    if any(word in lowered for word in ("o que", "como", "bagagem", "voo", "ola", "obrigado", "reembolso", "remarcacao", "reserva")):
        return "Portuguese"
    if any(word in lowered for word in ("equipaje", "vuelo", "hola", "gracias", "reembolso", "cambio de reserva", "cancelado")):
        return "Spanish"
    if any(word in lowered for word in ("what", "how", "baggage", "flight", "hello", "thanks", "refund", "rebooking", "cancelled")):
        return "English"
    return "Other"


class ConversationService:
    def __init__(self, provider: AIProvider, prompt_builder: PromptBuilder | None = None):
        self.provider = provider; self.prompt_builder = prompt_builder or PromptBuilder()
        self.configurations = AgentConfigurationRepository(); self.conversations = ConversationRepository()

    def respond(self, db, conversation: Conversation, content: str, airline_name: str, intent_name: str):
        config = db.scalar(select(AirlinePromptConfiguration).where(AirlinePromptConfiguration.airline_id == conversation.airline_id)) or self.configurations.get_active(db)
        previous_messages = db.scalars(select(Message).where(Message.conversation_id == conversation.id).order_by(Message.created_at)).all()
        history = "\n".join(f"{message.role}: {message.content}" for message in previous_messages)
        prompt = self.prompt_builder.build(config.context, config.guardrails, config.content, config.language, airline_name, intent_name, content, history)
        result = self.provider.complete(prompt)
        conversation.language = detect_language(content)
        user_message = Message(conversation_id=conversation.id, role="user", content=content)
        settings = get_settings()
        estimated_cost = result.input_tokens * settings.input_price_per_token + result.output_tokens * settings.output_price_per_token
        assistant_message = Message(conversation_id=conversation.id, role="assistant", content=result.content, input_tokens=result.input_tokens, output_tokens=result.output_tokens, total_tokens=result.input_tokens + result.output_tokens, estimated_cost=estimated_cost)
        db.add_all([user_message, assistant_message]); db.commit(); db.refresh(user_message); db.refresh(assistant_message)
        return user_message, assistant_message


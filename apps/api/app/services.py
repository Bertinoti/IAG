from .agent import AIProvider, PromptBuilder
from .models import Conversation, Message
from .repositories import AgentConfigurationRepository, ConversationRepository
from .config import get_settings

class ConversationService:
    def __init__(self, provider: AIProvider, prompt_builder: PromptBuilder | None = None):
        self.provider = provider; self.prompt_builder = prompt_builder or PromptBuilder()
        self.configurations = AgentConfigurationRepository(); self.conversations = ConversationRepository()

    def respond(self, db, conversation: Conversation, content: str, airline_name: str, intent_name: str):
        config = self.configurations.get_active(db)
        prompt = self.prompt_builder.build(config.context, config.guardrails, config.content, config.language, airline_name, intent_name, content)
        result = self.provider.complete(prompt)
        user_message = Message(conversation_id=conversation.id, role="user", content=content)
        settings = get_settings()
        estimated_cost = result.input_tokens * settings.input_price_per_token + result.output_tokens * settings.output_price_per_token
        assistant_message = Message(conversation_id=conversation.id, role="assistant", content=result.content, input_tokens=result.input_tokens, output_tokens=result.output_tokens, total_tokens=result.input_tokens + result.output_tokens, estimated_cost=estimated_cost)
        db.add_all([user_message, assistant_message]); db.commit(); db.refresh(user_message); db.refresh(assistant_message)
        return user_message, assistant_message

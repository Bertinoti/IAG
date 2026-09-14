from pydantic import BaseModel, Field

class ConfigPayload(BaseModel):
    context: str = Field(max_length=10000)
    guardrails: str = Field(max_length=10000)
    content: str = Field(max_length=10000)
    language: str = Field(min_length=1, max_length=300)

class ConversationPayload(BaseModel):
    airline_id: int
    intent_id: int

class MessagePayload(BaseModel):
    content: str = Field(min_length=1, max_length=4000)

class RatingPayload(BaseModel):
    rating: str = Field(pattern="^(positive|negative)$")

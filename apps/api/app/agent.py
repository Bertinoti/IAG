from dataclasses import dataclass
import httpx
from .config import get_settings

@dataclass
class AIResult:
    content: str
    input_tokens: int
    output_tokens: int

class PromptBuilder:
    def build(self, context: str, guardrails: str, content: str, language: str, airline: str, intent: str, message: str, history: str = "") -> str:
        conversation = f"Conversation history:\n{history}\n" if history else ""
        return f"Context: {context}\nGuardrails: {guardrails}\nContent: {content}\nLanguage: {language}\nAirline: {airline}\nIntent: {intent}\n{conversation}Latest user message: {message}"

class AIProvider:
    def complete(self, prompt: str) -> AIResult:
        raise NotImplementedError

class ProviderError(RuntimeError):
    pass

class OpenAIProvider(AIProvider):
    def complete(self, prompt: str) -> AIResult:
        settings = get_settings()
        if not settings.openai_api_key:
            raise ProviderError("AI provider is not configured")
        try:
            response = httpx.post("https://api.openai.com/v1/chat/completions", headers={"Authorization": f"Bearer {settings.openai_api_key}", "Content-Type": "application/json"}, json={"model": settings.openai_model, "messages": [{"role": "user", "content": prompt}]}, timeout=30.0)
            response.raise_for_status()
            data = response.json(); usage = data.get("usage", {})
            return AIResult(data["choices"][0]["message"]["content"], int(usage.get("prompt_tokens", 0)), int(usage.get("completion_tokens", 0)))
        except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError) as exc:
            raise ProviderError("AI provider request failed") from exc

from dataclasses import dataclass

@dataclass
class AIResult:
    content: str
    input_tokens: int
    output_tokens: int

class PromptBuilder:
    def build(self, context: str, guardrails: str, content: str, language: str, airline: str, intent: str, message: str) -> str:
        return f"Context: {context}\nGuardrails: {guardrails}\nContent: {content}\nLanguage: {language}\nAirline: {airline}\nIntent: {intent}\nUser: {message}"

class AIProvider:
    def complete(self, prompt: str) -> AIResult:
        raise NotImplementedError

class OpenAIProvider(AIProvider):
    def complete(self, prompt: str) -> AIResult:
        # Provider boundary is ready for the OpenAI SDK; local foundation fallback keeps demos bootable.
        return AIResult("Demo response from the Airline AI Agent provider.", len(prompt.split()), 9)

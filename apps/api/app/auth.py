import base64
import hashlib
import hmac
import secrets
import time

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy import text
from sqlalchemy.orm import Session

from .config import get_settings
from .database import get_db
from .models import User


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        _, salt_text, digest_text = encoded.split("$", 2)
        salt = base64.urlsafe_b64decode(salt_text.encode())
        expected = base64.urlsafe_b64decode(digest_text.encode())
        actual = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def _signature(payload: str) -> str:
    return hmac.new(get_settings().session_secret.encode(), payload.encode(), hashlib.sha256).hexdigest()


def create_session(user_id: int, max_age: int | None = None) -> str:
    expiry = int(time.time()) + (max_age if max_age is not None else get_settings().session_max_age)
    payload = f"{user_id}:{expiry}"
    return f"{payload}.{_signature(payload)}"


def read_session(value: str | None) -> int | None:
    if not value or "." not in value:
        return None
    payload, signature = value.rsplit(".", 1)
    if not hmac.compare_digest(_signature(payload), signature):
        return None
    try:
        user_id_text, expiry_text = payload.split(":", 1)
        if int(expiry_text) <= int(time.time()):
            return None
        return int(user_id_text)
    except ValueError:
        return None


def get_current_admin(
    session_cookie: str | None = Cookie(default=None, alias=get_settings().session_cookie_name),
    db: Session = Depends(get_db),
) -> User:
    user_id = read_session(session_cookie)
    user = db.scalar(select(User).where(User.id == user_id, User.role == "admin")) if user_id else None
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user


def seed_admin() -> None:
    from .database import Base, engine, SessionLocal
    from .models import Airline, AirlinePromptConfiguration, Intent
    from .services import detect_language

    Base.metadata.create_all(engine)
    with engine.begin() as connection:
        columns = connection.execute(text("PRAGMA table_info(conversations)")).fetchall()
        if not any(column[1] == "language" for column in columns):
            connection.execute(text("ALTER TABLE conversations ADD COLUMN language VARCHAR(20) DEFAULT 'unknown'"))
    with SessionLocal() as db:
        email = get_settings().admin_email.strip().lower()
        if db.scalar(select(User).where(User.email == email)) is None:
            db.add(User(email=email, password_hash=hash_password(get_settings().admin_password), role="admin"))
        airlines = [
            ("British Airways", "BA"),
            ("Iberia", "IB"),
            ("Vueling", "VY"),
            ("Aer Lingus", "EI"),
            ("LEVEL", "LV"),
        ]
        existing = db.scalars(select(Airline).order_by(Airline.id)).all()
        for index, airline in enumerate(existing[: len(airlines)]):
            airline.code = f"MIGRATING-{airline.id}-{index}"
        db.flush()
        for index, (name, code) in enumerate(airlines):
            if index < len(existing):
                existing[index].name, existing[index].code = name, code
            else:
                db.add(Airline(name=name, code=code))
        db.flush()
        prompt_data = {
            "BA": ("British Airways international support", "Use British Airways terminology and official policy tone.", "Focus on Heathrow operations, Avios, baggage and British Airways service policies."),
            "IB": ("Iberia customer care", "Use clear Iberia terminology and distinguish Iberia services from partner airlines.", "Focus on Madrid hub operations, Iberia Plus, baggage and Iberia travel policies."),
            "VY": ("Vueling low-cost European travel support", "Be concise, practical and transparent about Vueling restrictions and fees. Never apply this rule to another airline or flight. Detect the user's language and respond in the language of the latest user message. Use the conversation history to handle follow-up questions. For VY8730, once the customer chooses an option, do not repeat the initial options question and do not ask them to choose again.", "Focus on Barcelona and European routes, fare bundles, baggage and Vueling policies. Apply the following scripted flow only to Vueling flight VY8730: when the customer asks about its cancellation, translate this source message into the latest user language: 'Your flight is cancelled. We have two active options for your flight: a refund or rebooking.' When the latest message clearly chooses a refund, answer with a complete acknowledgement equivalent to: 'You chose a refund. Your request has been recorded. You will receive an email confirming your choice.' When the latest message clearly chooses rebooking, use the equivalent acknowledgement for rebooking and confirm that an email will arrive. Do not repeat the cancellation options, ask another preference question, or add fare or fee caveats unless the customer explicitly asks about cost. If cost is asked, explain that any applicable fare difference or fee must be confirmed for the booking without inventing a price. This instruction applies only to VY8730 operated by Vueling."),
            "EI": ("Aer Lingus travel support", "Use friendly Irish airline terminology and avoid promising exceptions.", "Focus on Dublin connectivity, transatlantic travel, baggage and Aer Lingus policies, including clear transatlantic connection guidance."),
            "LV": ("LEVEL long-haul low-cost support", "Explain included and optional services precisely for LEVEL fares.", "Focus on LEVEL long-haul routes, fare inclusions, baggage and onboard services."),
        }
        for airline in db.scalars(select(Airline)).all():
            context, guardrails, content = prompt_data[airline.code]
            config = db.scalar(select(AirlinePromptConfiguration).where(AirlinePromptConfiguration.airline_id == airline.id))
            # Migrate the VY8730 follow-up rule once; preserve later admin edits.
            needs_default = config is None or (airline.code == "VY" and ("do not repeat the initial options question" not in config.guardrails or "You chose a refund" not in config.content)) or (airline.code == "EI" and config.content == "Airline policies")
            if config is None:
                config = AirlinePromptConfiguration(airline_id=airline.id, context=context, guardrails=guardrails, content=content, language="Detect the user's language and respond in the same language. If the user changes language, always respond in the language of the latest message.")
                db.add(config)
            elif needs_default:
                config.context, config.guardrails, config.content = context, guardrails, content
                config.language = "Detect the user's language and respond in the same language. If the user changes language, always respond in the language of the latest message."
        for name in ["baggage", "check-in", "booking", "cancellation", "flight-status"]:
            if db.scalar(select(Intent).where(Intent.name == name)) is None: db.add(Intent(name=name))
        # Keep historical dashboard data consistent with the current detector.
        # The latest user message defines the conversation language.
        from .models import Conversation, Message
        for conversation in db.scalars(select(Conversation)).all():
            latest_user_message = db.scalar(
                select(Message)
                .where(Message.conversation_id == conversation.id, Message.role == "user")
                .order_by(Message.created_at.desc())
            )
            if latest_user_message:
                conversation.language = detect_language(latest_user_message.content)
        db.commit()

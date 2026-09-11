from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..auth import get_current_admin
from ..database import get_db
from ..models import AgentConfiguration, User
from ..repositories import AgentConfigurationRepository
from ..schemas import ConfigPayload
router = APIRouter(prefix="/api/agent-config", tags=["agent configuration"])
def config_out(c: AgentConfiguration) -> dict[str, object]: return {"id": c.id, "context": c.context, "guardrails": c.guardrails, "content": c.content, "language": c.language, "created_at": c.created_at, "updated_at": c.updated_at}
@router.get("")
def get_config(_: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]: return config_out(AgentConfigurationRepository().get_active(db))
@router.put("")
def put_config(payload: ConfigPayload, _: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    c = db.scalar(select(AgentConfiguration).order_by(AgentConfiguration.id)) or AgentConfiguration(); c.context, c.guardrails, c.content, c.language = payload.context, payload.guardrails, payload.content, payload.language; db.add(c); db.commit(); db.refresh(c); return config_out(c)

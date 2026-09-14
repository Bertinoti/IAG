from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_admin
from ..database import get_db
from ..models import Airline, AirlinePromptConfiguration, User
from ..schemas import ConfigPayload

router = APIRouter(prefix="/api/airline-config", tags=["airline configuration"])


def output(airline: Airline, config: AirlinePromptConfiguration | None) -> dict[str, object]:
    return {
        "airline": {"id": airline.id, "name": airline.name, "code": airline.code},
        "configuration": {
            "id": config.id if config else None,
            "context": config.context if config else "",
            "guardrails": config.guardrails if config else "",
            "content": config.content if config else "",
            "language": config.language if config else "English",
        },
    }


@router.get("")
def list_configs(_: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    airlines = db.scalars(select(Airline).order_by(Airline.name)).all()
    configs = {c.airline_id: c for c in db.scalars(select(AirlinePromptConfiguration)).all()}
    return {"items": [output(airline, configs.get(airline.id)) for airline in airlines]}


@router.put("/{airline_id}")
def save_config(airline_id: int, payload: ConfigPayload, _: User = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, object]:
    airline = db.get(Airline, airline_id)
    if airline is None:
        raise HTTPException(status_code=404, detail="Airline not found")
    config = db.scalar(select(AirlinePromptConfiguration).where(AirlinePromptConfiguration.airline_id == airline_id))
    if config is None:
        config = AirlinePromptConfiguration(airline_id=airline_id)
    config.context, config.guardrails, config.content, config.language = payload.context, payload.guardrails, payload.content, payload.language
    db.add(config)
    db.commit()
    db.refresh(config)
    return output(airline, config)

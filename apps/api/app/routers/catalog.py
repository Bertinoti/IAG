from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..repositories import CatalogRepository
router = APIRouter(prefix="/api", tags=["catalog"])
@router.get("/airlines")
def airlines(db: Session = Depends(get_db)) -> dict[str, object]:
    return {"items": [{"id": a.id, "name": a.name, "code": a.code, "created_at": a.created_at} for a in CatalogRepository().airlines(db)]}
@router.get("/intents")
def intents(db: Session = Depends(get_db)) -> dict[str, object]:
    return {"items": [{"id": i.id, "name": i.name, "created_at": i.created_at} for i in CatalogRepository().intents(db)]}

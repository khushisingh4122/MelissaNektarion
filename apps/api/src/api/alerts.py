from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.pest_detection import PestDetection
from src.models.drone import Drone

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/")
def get_alerts(db: Session = Depends(get_db)):
    alerts = [
        {
            "id": f"pest-{row.id}",
            "severity": "warning",
            "title": f"{row.pest_name} detected",
            "description": "Inspect the affected field.",
            "field": "Field B",
        }
        for row in db.query(PestDetection).order_by(PestDetection.id.desc()).limit(10).all()
    ]
    for drone in db.query(Drone).all():
        if drone.status in {"inactive", "offline"}:
            alerts.append({"id": f"drone-{drone.id}", "severity": "attention", "title": f"{drone.name} unavailable", "description": "Check the drone connection.", "field": None})
    return alerts

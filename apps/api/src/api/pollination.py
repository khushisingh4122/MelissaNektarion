from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.mission import Mission

router = APIRouter(prefix="/pollination", tags=["Pollination"])


@router.get("/mission/{mission_id}")
def get_pollination_progress(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    progress = 68 if mission and mission.status in {"dispatched", "flying", "completed"} else 0
    return {
        "mission_id": mission_id,
        "progress": progress,
        "covered_acres": round(progress / 10, 1),
        "total_acres": 10,
        "pollen_active": progress > 0,
        "status": mission.status if mission else "not_found",
    }


@router.get("/coverage/{mission_id}")
def get_pollination_coverage(mission_id: int, db: Session = Depends(get_db)):
    result = get_pollination_progress(mission_id, db)
    result["coverage_path"] = []
    return result

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.mission import Mission
from src.services.drone_runtime import drone_runtime

router = APIRouter(prefix="/pollination", tags=["Pollination"])


class PollinationToggle(BaseModel):
    paused: bool = True


@router.get("/mission/{mission_id}")
def get_pollination_progress(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    runtime = drone_runtime.snapshot()
    progress = runtime["progress"] if runtime["mission_id"] == mission_id else (68 if mission and mission.status in {"dispatched", "flying", "completed"} else 0)
    return {
        "mission_id": mission_id,
        "progress": progress,
        "covered_acres": round(progress / 10, 1),
        "total_acres": 10,
        "pollen_active": progress > 0 and not runtime["pollination_paused"],
        "pump_running": runtime["pollination_motor_running"],
        "status": mission.status if mission else "not_found",
        "pollination_paused": runtime["pollination_paused"],
        "returning_home": runtime["returning_home"],
        "drone_status": runtime["status"],
    }


@router.post("/mission/{mission_id}/toggle")
def toggle_pollination(mission_id: int, payload: PollinationToggle):
    if payload.paused:
        result = drone_runtime.pause_pollination()
        return {"status": "paused", "pump_running": False, "drone_status": result["status"], "runtime": result}
    result = drone_runtime.resume_pollination()
    return {"status": "active", "pump_running": True, "drone_status": result["status"], "runtime": result}


@router.get("/coverage/{mission_id}")
def get_pollination_coverage(mission_id: int, db: Session = Depends(get_db)):
    result = get_pollination_progress(mission_id, db)
    result["coverage_path"] = []
    return result

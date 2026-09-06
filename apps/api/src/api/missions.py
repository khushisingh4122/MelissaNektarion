from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.mission import Mission
from src.schemas.mission import MissionCreate, MissionUpdate


router = APIRouter(
    prefix="/missions",
    tags=["Missions"]
)


@router.post("/")
def create_mission(
    mission_data: MissionCreate,
    db: Session = Depends(get_db)
):
    mission = Mission(
        name=mission_data.name,
        location=mission_data.location,
        drone_id=mission_data.drone_id
    )

    db.add(mission)
    db.commit()
    db.refresh(mission)

    return mission


@router.get("/")
def get_all_missions(
    db: Session = Depends(get_db)
):
    return db.query(Mission).all()


@router.put("/{mission_id}/status")
def update_mission_status(
    mission_id: int,
    mission_data: MissionUpdate,
    db: Session = Depends(get_db)
):
    mission = db.query(Mission).filter(
        Mission.id == mission_id
    ).first()

    if not mission:
        raise HTTPException(
            status_code=404,
            detail="Mission not found"
        )

    mission.status = mission_data.status

    db.commit()
    db.refresh(mission)

    return mission
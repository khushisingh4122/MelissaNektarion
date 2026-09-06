from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.pest_detection import PestDetection
from src.schemas.pest_detection import PestDetectionCreate


router = APIRouter(
    prefix="/pest-detection",
    tags=["Pest Detection"]
)


@router.post("/")
def create_pest_detection(
    pest_data: PestDetectionCreate,
    db: Session = Depends(get_db)
):
    data = PestDetection(
        drone_id=pest_data.drone_id,
        mission_id=pest_data.mission_id,
        pest_name=pest_data.pest_name,
        confidence=pest_data.confidence
    )

    db.add(data)
    db.commit()
    db.refresh(data)

    return data


@router.get("/")
def get_all_pest_detections(
    db: Session = Depends(get_db)
):
    return db.query(PestDetection).all()


@router.get("/mission/{mission_id}")
def get_mission_pest_detections(
    mission_id: int,
    db: Session = Depends(get_db)
):
    return db.query(PestDetection).filter(
        PestDetection.mission_id == mission_id
    ).all()
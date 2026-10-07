from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.crop_monitoring import CropMonitoring
from src.schemas.crop_monitoring import CropMonitoringCreate


router = APIRouter(
    prefix="/crop-monitoring",
    tags=["Crop Monitoring"]
)


@router.post("/")
def create_crop_monitoring(
    crop_data: CropMonitoringCreate,
    db: Session = Depends(get_db)
):
    data = CropMonitoring(
        drone_id=crop_data.drone_id,
        mission_id=crop_data.mission_id,
        crop_health=crop_data.crop_health,
        health_score=crop_data.health_score
    )

    db.add(data)
    db.commit()
    db.refresh(data)

    return data


@router.get("/")
def get_all_crop_monitoring(
    db: Session = Depends(get_db)
):
    return db.query(CropMonitoring).all()


@router.get("/mission/{mission_id}")
def get_mission_crop_data(
    mission_id: int,
    db: Session = Depends(get_db)
):
    return db.query(CropMonitoring).filter(
        CropMonitoring.mission_id == mission_id
    ).all()
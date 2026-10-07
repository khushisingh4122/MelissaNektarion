from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.sensor_data import SensorData
from src.schemas.sensor_data import SensorDataCreate


router = APIRouter(
    prefix="/sensor-data",
    tags=["Sensor Data"]
)


@router.post("/")
def create_sensor_data(
    sensor_data: SensorDataCreate,
    db: Session = Depends(get_db)
):
    data = SensorData(
        drone_id=sensor_data.drone_id,
        mission_id=sensor_data.mission_id,
        sensor_type=sensor_data.sensor_type,
        value=sensor_data.value
    )

    db.add(data)
    db.commit()
    db.refresh(data)

    return data


@router.get("/")
def get_all_sensor_data(
    db: Session = Depends(get_db)
):
    return db.query(SensorData).all()


@router.get("/mission/{mission_id}")
def get_mission_sensor_data(
    mission_id: int,
    db: Session = Depends(get_db)
):
    return db.query(SensorData).filter(
        SensorData.mission_id == mission_id
    ).all()
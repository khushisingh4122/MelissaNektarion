from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.drone import Drone
from src.schemas.drone import DroneCreate, DroneUpdate


router = APIRouter(
    prefix="/drones",
    tags=["Drones"]
)


@router.post("/")
def create_drone(
    drone_data: DroneCreate,
    db: Session = Depends(get_db)
):
    drone = Drone(
        name=drone_data.name,
        model=drone_data.model
    )

    db.add(drone)
    db.commit()
    db.refresh(drone)

    return drone


@router.get("/")
def get_all_drones(
    db: Session = Depends(get_db)
):
    return db.query(Drone).all()


@router.get("/{drone_id}")
def get_drone(
    drone_id: int,
    db: Session = Depends(get_db)
):
    drone = db.query(Drone).filter(
        Drone.id == drone_id
    ).first()

    if not drone:
        raise HTTPException(
            status_code=404,
            detail="Drone not found"
        )

    return drone


@router.put("/{drone_id}/status")
def update_drone_status(
    drone_id: int,
    drone_data: DroneUpdate,
    db: Session = Depends(get_db)
):
    drone = db.query(Drone).filter(
        Drone.id == drone_id
    ).first()

    if not drone:
        raise HTTPException(
            status_code=404,
            detail="Drone not found"
        )

    drone.status = drone_data.status

    db.commit()
    db.refresh(drone)

    return drone


@router.get("/{drone_id}/telemetry")
def get_drone_telemetry(
    drone_id: int,
    db: Session = Depends(get_db)
):
    drone = db.query(Drone).filter(Drone.id == drone_id).first()
    if not drone:
        raise HTTPException(status_code=404, detail="Drone not found")

    return {
        "drone_id": drone.id,
        "status": drone.status,
        "battery": 72 if drone.status == "active" else 95,
        "speed": 5.2 if drone.status == "active" else 0,
        "altitude": 12 if drone.status == "active" else 0,
        "location": "Apple Orchard Farm",
        "direction": "North-East",
        "camera": "online",
        "gps": "locked",
    }
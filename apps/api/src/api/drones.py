from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.drone import Drone
from src.schemas.drone import DroneCreate, DroneUpdate
from src.services.drone_runtime import drone_runtime
from src.services.hardware_gateway import hardware_gateway


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

    runtime = drone_runtime.snapshot()
    hardware = hardware_gateway.telemetry_for(drone_id) or {}
    gps = hardware.get("gps") or runtime["gps"]
    return {
        "drone_id": drone.id,
        "status": runtime["status"],
        "battery": hardware.get("battery", runtime["battery"]),
        "speed": hardware.get("speed", runtime["speed"]),
        "altitude": hardware.get("altitude", runtime["altitude"]),
        "location": "Apple Orchard Farm" if gps is None else f"{gps['latitude']}, {gps['longitude']}",
        "direction": "North-East",
        "camera": "online" if hardware.get("camera_available") else "waiting",
        "gps": "locked" if gps else "waiting",
        "connected": hardware.get("connected", runtime["connected"]),
        "manual_override": runtime["manual_override"],
        "returning_home": runtime["returning_home"],
    }


@router.get("/runtime")
def get_drone_runtime():
    return drone_runtime.snapshot()
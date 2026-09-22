from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.mission import Mission
from src.schemas.mission import MissionCreate, MissionUpdate
from src.services.drone_runtime import drone_runtime
from src.api.pixhawk import pixhawk
from src.services.hardware_gateway import hardware_gateway


router = APIRouter(
    prefix="/missions",
    tags=["Missions"]
)


class MissionControlRequest(BaseModel):
    mode: str
    enabled: bool = True


@router.post("/")
def create_mission(
    mission_data: MissionCreate,
    db: Session = Depends(get_db)
):
    mission = Mission(
        name=mission_data.name,
        location=mission_data.location,
        drone_id=mission_data.drone_id,
        status=mission_data.status or "saved",
        pollination_zones=mission_data.pollination_zones or [],
        pesticide_zones=mission_data.pesticide_zones or [],
        mission_name=mission_data.mission_name or mission_data.name,
        crop=mission_data.crop,
        altitude=mission_data.altitude,
        speed=mission_data.speed,
        pattern=mission_data.pattern,
        priority=mission_data.priority,
        waypoints=mission_data.waypoints or [],
        route_distance=mission_data.route_distance,
        estimated_flight_time=mission_data.estimated_flight_time,
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


@router.get("/{mission_id}")
def get_mission(
    mission_id: int,
    db: Session = Depends(get_db)
):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission


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
    if mission_data.pollination_zones is not None:
        mission.pollination_zones = mission_data.pollination_zones
    if mission_data.pesticide_zones is not None:
        mission.pesticide_zones = mission_data.pesticide_zones
    for field in (
        "mission_name", "crop", "altitude", "speed", "pattern", "priority",
        "waypoints", "route_distance", "estimated_flight_time",
    ):
        value = getattr(mission_data, field)
        if value is not None:
            setattr(mission, field, value)

    db.commit()
    db.refresh(mission)

    return mission


@router.post("/{mission_id}/validate")
def validate_mission(
    mission_id: int,
    db: Session = Depends(get_db)
):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    runtime = drone_runtime.snapshot()
    hardware = hardware_gateway.telemetry_for(mission.drone_id) or {}
    hardware_connected = pixhawk.connection is not None or hardware.get("connected", False)
    hardware_gps = hardware.get("gps") or runtime["gps"]
    hardware_battery = hardware.get("battery", runtime["battery"])
    reasons = []

    if not hardware_connected:
        reasons.append("Pixhawk is not connected.")
    if not runtime["connected"]:
        reasons.append("Live drone telemetry is not connected.")
    if not runtime["internet_connected"]:
        reasons.append("Raspberry Pi/backend network connection is unavailable.")
    if hardware_gps is None:
        reasons.append("GPS position is not available or GPS lock is missing.")
    if hardware_battery is None:
        reasons.append("Battery telemetry is not available.")
    elif hardware_battery < 25.0:
        reasons.append(f"Battery is too low: {hardware_battery:.1f}% available.")
    if not mission.location:
        reasons.append("Mission field is not selected.")
    if not mission.waypoints or len(mission.waypoints) < 2:
        reasons.append("Mission needs at least two route waypoints.")

    if reasons:
        mission.status = "saved"
        db.commit()
        db.refresh(mission)
        return {"valid": False, "reasons": reasons, "mission": mission, "runtime": runtime}

    mission.status = "validated"
    db.commit()
    db.refresh(mission)
    return {"valid": True, "reasons": [], "mission": mission, "runtime": runtime}


@router.post("/{mission_id}/dispatch")
def dispatch_mission(
    mission_id: int,
    db: Session = Depends(get_db)
):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    if mission.status != "validated":
        raise HTTPException(status_code=409, detail="Mission must pass pre-flight checks before dispatch.")

    mission.status = "dispatched"
    db.commit()
    db.refresh(mission)

    drone_runtime.attach_mission(mission.id, mission.name, waypoints=mission.waypoints or [])
    command = hardware_gateway.enqueue(
        mission.drone_id,
        "start_mission",
        {
            "mission_id": mission.id,
            "name": mission.name,
            "waypoints": mission.waypoints or [],
            "pollination_zones": mission.pollination_zones or [],
        },
    )
    return {"sent": True, "status": mission.status, "mission": mission, "command": command, "runtime": drone_runtime.snapshot()}


@router.post("/{mission_id}/return-home")
def mission_return_home(
    mission_id: int,
    db: Session = Depends(get_db)
):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    mission.status = "returning_home"
    db.commit()
    db.refresh(mission)
    command = hardware_gateway.enqueue(mission.drone_id, "return_home")
    return {"status": mission.status, "command": command, "runtime": drone_runtime.return_home()}


@router.post("/{mission_id}/stop")
def mission_stop(
    mission_id: int,
    db: Session = Depends(get_db)
):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    mission.status = "returning_home"
    db.commit()
    db.refresh(mission)
    command = hardware_gateway.enqueue(mission.drone_id, "stop_mission")
    return {"status": mission.status, "command": command, "runtime": drone_runtime.stop_mission()}


@router.post("/{mission_id}/land")
def mission_land(
    mission_id: int,
    db: Session = Depends(get_db)
):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    mission.status = "landed"
    db.commit()
    db.refresh(mission)
    command = hardware_gateway.enqueue(mission.drone_id, "land")
    return {"status": mission.status, "command": command, "runtime": drone_runtime.land_now()}


@router.post("/{mission_id}/manual-override")
def mission_manual_override(
    mission_id: int,
    payload: MissionControlRequest,
    db: Session = Depends(get_db)
):
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    if payload.mode == "manual":
        mission.status = "manual_override" if payload.enabled else "dispatched"
        db.commit()
        db.refresh(mission)
        return {"status": mission.status, "runtime": drone_runtime.set_manual_override(payload.enabled)}

    raise HTTPException(status_code=400, detail="Unsupported control mode")
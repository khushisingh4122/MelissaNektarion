from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.core.hardware_auth import require_hardware_token
from src.models.drone import Drone
from src.models.telemetry import TelemetryReading
from src.services.drone_runtime import drone_runtime
from src.services.hardware_gateway import hardware_gateway

router = APIRouter(prefix="/hardware", tags=["Hardware Bridge"])


class HardwareTelemetry(BaseModel):
    connected: bool = False
    internet_connected: bool = True
    gps: dict[str, float] | None = None
    battery: float | None = Field(default=None, ge=0, le=100)
    altitude: float | None = None
    speed: float | None = None
    flight_mode: str | None = None
    armed: bool | None = None
    camera_available: bool = False


class CommandAck(BaseModel):
    command_id: str


@router.post("/telemetry/{drone_id}")
def receive_telemetry(
    drone_id: int,
    telemetry: HardwareTelemetry,
    db: Session = Depends(get_db),
    _: None = Depends(require_hardware_token),
):
    if not db.query(Drone).filter(Drone.id == drone_id).first():
        raise HTTPException(status_code=404, detail="Drone not found")

    payload = telemetry.model_dump()
    db.add(TelemetryReading(
        drone_id=drone_id,
        mission_id=drone_runtime.snapshot().get("mission_id"),
        connected=telemetry.connected,
        battery=telemetry.battery,
        altitude=telemetry.altitude,
        speed=telemetry.speed,
        flight_mode=telemetry.flight_mode,
        armed=telemetry.armed,
        gps=telemetry.gps,
    ))
    db.commit()
    hardware_gateway.update_telemetry(drone_id, payload)
    runtime = drone_runtime.update_telemetry(
        battery=telemetry.battery,
        altitude=telemetry.altitude,
        speed=telemetry.speed,
        gps=telemetry.gps,
        connected=telemetry.connected,
        internet_connected=telemetry.internet_connected,
    )
    return {"accepted": True, "runtime": runtime}


@router.get("/commands/{drone_id}")
def get_hardware_commands(drone_id: int, _: None = Depends(require_hardware_token)):
    return {"drone_id": drone_id, "commands": hardware_gateway.commands_for(drone_id)}


@router.post("/commands/{drone_id}/ack")
def acknowledge_hardware_command(
    drone_id: int,
    payload: CommandAck,
    _: None = Depends(require_hardware_token),
):
    if not hardware_gateway.acknowledge(drone_id, payload.command_id):
        raise HTTPException(status_code=404, detail="Hardware command not found")
    return {"acknowledged": True, "command_id": payload.command_id}


@router.get("/status/{drone_id}")
def hardware_status(drone_id: int):
    return {
        "drone_id": drone_id,
        "telemetry": hardware_gateway.telemetry_for(drone_id),
        "runtime": drone_runtime.snapshot(),
    }

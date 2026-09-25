import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.hardware.pixhawk import Pixhawk
from src.services.hardware_gateway import hardware_gateway


router = APIRouter(
    prefix="/pixhawk",
    tags=["Pixhawk"]
)


pixhawk = Pixhawk(baud=int(os.getenv("PIXHAWK_BAUD", "57600")))


class PixhawkConnection(BaseModel):
    connection_string: str | None = None
    baud: int | None = None


@router.post("/connect")
def connect_pixhawk(data: PixhawkConnection):
    if pixhawk.connection is not None:
        return {
            "connected": True,
            "message": "Pixhawk is already connected"
        }

    connection_string = data.connection_string or os.getenv("PIXHAWK_CONNECTION")
    if not connection_string:
        raise HTTPException(
            status_code=400,
            detail="Set PIXHAWK_CONNECTION or provide connection_string.",
        )

    success = pixhawk.connect(connection_string, data.baud)

    if not success:
        raise HTTPException(
            status_code=503,
            detail="Failed to connect to Pixhawk"
        )

    return {
        "connected": True,
        "message": "Pixhawk connected successfully",
        "connection_string": connection_string,
    }


@router.post("/disconnect")
def disconnect_pixhawk():
    if pixhawk.connection is None:
        return {
            "connected": False,
            "message": "Pixhawk is already disconnected"
        }

    pixhawk.disconnect()

    return {
        "connected": False,
        "message": "Pixhawk disconnected successfully"
    }


@router.get("/status")
def pixhawk_status():
    if pixhawk.connection is None:
        remote = hardware_gateway.telemetry_for(int(os.getenv("DRONE_ID", "1")))
        if remote and remote.get("connected"):
            return {
                "connected": True,
                "message": "Pixhawk telemetry received from Raspberry Pi",
                "source": "raspberry_pi",
            }
        return {
            "connected": False,
            "message": "Pixhawk not connected"
        }

    return {
        "connected": True,
        "message": "Pixhawk connected",
        "connection_configured": bool(os.getenv("PIXHAWK_CONNECTION")),
    }


@router.get("/gps")
def get_gps():
    if pixhawk.connection is None:
        raise HTTPException(
            status_code=503,
            detail="Pixhawk not connected"
        )

    try:
        return pixhawk.get_gps()
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e)
        )


@router.get("/battery")
def get_battery():
    if pixhawk.connection is None:
        raise HTTPException(
            status_code=503,
            detail="Pixhawk not connected"
        )

    try:
        return pixhawk.get_battery()
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e)
        )


@router.get("/altitude")
def get_altitude():
    if pixhawk.connection is None:
        raise HTTPException(
            status_code=503,
            detail="Pixhawk not connected"
        )

    try:
        return {
            "altitude": pixhawk.get_altitude()
        }
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e)
        )


@router.get("/mode")
def get_mode():
    if pixhawk.connection is None:
        raise HTTPException(
            status_code=503,
            detail="Pixhawk not connected"
        )

    return {
        "mode": pixhawk.get_mode()
    }


@router.get("/armed")
def get_armed_status():
    if pixhawk.connection is None:
        raise HTTPException(
            status_code=503,
            detail="Pixhawk not connected"
        )

    return {
        "armed": pixhawk.is_armed()
    }


@router.get("/telemetry")
def get_telemetry():
    if pixhawk.connection is None:
        remote = hardware_gateway.telemetry_for(int(os.getenv("DRONE_ID", "1")))
        if remote and remote.get("connected"):
            return {
                "connected": True,
                "source": "raspberry_pi",
                "gps": remote.get("gps"),
                "battery": {"battery_remaining": remote.get("battery")},
                "speed": {"ground_speed": remote.get("speed") or 0},
                "altitude": remote.get("altitude"),
                "mode": remote.get("flight_mode"),
                "armed": remote.get("armed"),
            }
        raise HTTPException(status_code=503, detail="Pixhawk not connected")

    try:
        gps = pixhawk.get_gps()
        battery = pixhawk.get_battery()
        speed = pixhawk.get_speed()
        return {
            "connected": True,
            "gps": gps,
            "battery": battery,
            "speed": speed,
            "altitude": gps["altitude"],
            "mode": pixhawk.get_mode(),
            "armed": pixhawk.is_armed(),
        }
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
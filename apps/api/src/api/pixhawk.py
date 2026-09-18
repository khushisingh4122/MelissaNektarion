from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.hardware.pixhawk import Pixhawk


router = APIRouter(
    prefix="/pixhawk",
    tags=["Pixhawk"]
)


pixhawk = Pixhawk()


class PixhawkConnection(BaseModel):
    connection_string: str


@router.post("/connect")
def connect_pixhawk(data: PixhawkConnection):
    if pixhawk.connection is not None:
        return {
            "connected": True,
            "message": "Pixhawk is already connected"
        }

    success = pixhawk.connect(data.connection_string)

    if not success:
        raise HTTPException(
            status_code=503,
            detail="Failed to connect to Pixhawk"
        )

    return {
        "connected": True,
        "message": "Pixhawk connected successfully"
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
        return {
            "connected": False,
            "message": "Pixhawk not connected"
        }

    return {
        "connected": True,
        "message": "Pixhawk connected"
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
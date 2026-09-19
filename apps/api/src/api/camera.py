from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from src.hardware.camera import LATEST_IMAGE, capture_image
from src.services.crop_disease_ai import analyze_image


router = APIRouter(prefix="/camera", tags=["Camera"])


@router.get("/status")
def camera_status():
    return {
        "available": LATEST_IMAGE.exists(),
        "latest_image": "/camera/latest" if LATEST_IMAGE.exists() else None,
    }


@router.get("/latest")
def latest_camera_image():
    if not LATEST_IMAGE.exists():
        raise HTTPException(status_code=404, detail="No camera image has been captured yet.")
    return FileResponse(LATEST_IMAGE, media_type="image/jpeg")


@router.post("/capture")
def capture_camera_image():
    try:
        image_path = capture_image()
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Camera capture failed: {error}") from error

    return {"captured": True, "image_url": "/camera/latest", "filename": image_path.name}


@router.post("/capture-and-analyze")
def capture_and_analyze():
    try:
        image_path = capture_image()
        result = analyze_image(image_path)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Camera analysis failed: {error}") from error

    return {"image_url": "/camera/latest", "filename": image_path.name, **result}
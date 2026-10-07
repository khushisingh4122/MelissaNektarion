from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pathlib import Path
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.hardware.camera import LATEST_IMAGE, capture_image, start_camera, stream_frames
from src.services.crop_disease_ai import analyze_image
from src.services.media_retention import purge_expired_media, register_media
from src.models.media_asset import MediaAsset


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


@router.get("/history")
def camera_history(limit: int = 100, db: Session = Depends(get_db)):
    purge_expired_media(db)
    assets = (
        db.query(MediaAsset)
        .order_by(MediaAsset.captured_at.desc())
        .limit(min(max(limit, 1), 500))
        .all()
    )
    return assets


@router.get("/history/{media_id}")
def historical_media(media_id: int, db: Session = Depends(get_db)):
    purge_expired_media(db)
    asset = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
    if not asset or not Path(asset.file_path).exists():
        raise HTTPException(status_code=404, detail="Media asset not found or expired")
    media_type = "video/mp4" if asset.media_type == "video" else "image/jpeg"
    return FileResponse(asset.file_path, media_type=media_type)


@router.post("/capture")
def capture_camera_image(db: Session = Depends(get_db)):
    try:
        image_path = capture_image()
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Camera capture failed: {error}") from error

    purge_expired_media(db)
    asset = register_media(db, image_path)
    return {"captured": True, "image_url": "/camera/latest", "filename": image_path.name, "media_id": asset.id, "expires_at": asset.expires_at}


@router.post("/capture-and-analyze")
def capture_and_analyze(db: Session = Depends(get_db)):
    try:
        image_path = capture_image()
        result = analyze_image(image_path)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Camera analysis failed: {error}") from error

    purge_expired_media(db)
    asset = register_media(db, image_path, analysis_status=result.get("status"))
    return {"image_url": "/camera/latest", "filename": image_path.name, "media_id": asset.id, "expires_at": asset.expires_at, **result}


@router.get("/stream")
def camera_stream():
    try:
        start_camera()
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"Camera stream failed: {error}") from error
    return StreamingResponse(stream_frames(), media_type="multipart/x-mixed-replace; boundary=frame")
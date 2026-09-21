from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from tempfile import NamedTemporaryFile
from pathlib import Path

from src.database.database import get_db
from src.models.pest_detection import PestDetection
from src.schemas.pest_detection import PestDetectionCreate


router = APIRouter(
    prefix="/pest-detection",
    tags=["Pest Detection"]
)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/analyze-image")
async def analyze_crop_image(
    file: UploadFile = File(...),
    analysis_focus: str = Form("complete"),
):
    """Analyze a crop image with the configured disease model."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Upload a JPEG, PNG, or WebP crop image.",
        )

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Images must be smaller than 10 MB.")

    from src.services.crop_disease_ai import analyze_image

    suffix = Path(file.filename or "crop-image.jpg").suffix or ".jpg"
    with NamedTemporaryFile(suffix=suffix, delete=False) as temporary_file:
        temporary_file.write(image_bytes)
        temporary_path = Path(temporary_file.name)

    try:
        return analyze_image(temporary_path, analysis_focus=analysis_focus)
    finally:
        temporary_path.unlink(missing_ok=True)


@router.post("/")
def create_pest_detection(
    pest_data: PestDetectionCreate,
    db: Session = Depends(get_db)
):
    data = PestDetection(
        drone_id=pest_data.drone_id,
        mission_id=pest_data.mission_id,
        pest_name=pest_data.pest_name,
        confidence=pest_data.confidence
    )

    db.add(data)
    db.commit()
    db.refresh(data)

    return data


@router.get("/")
def get_all_pest_detections(
    db: Session = Depends(get_db)
):
    return db.query(PestDetection).all()


@router.get("/mission/{mission_id}")
def get_mission_pest_detections(
    mission_id: int,
    db: Session = Depends(get_db)
):
    return db.query(PestDetection).filter(
        PestDetection.mission_id == mission_id
    ).all()
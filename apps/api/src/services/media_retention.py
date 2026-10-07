import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from src.models.media_asset import MediaAsset

RETENTION_DAYS = int(os.getenv("MEDIA_RETENTION_DAYS", "10"))


def register_media(
    db: Session,
    file_path: Path,
    media_type: str = "image",
    *,
    user_id: int | None = None,
    drone_id: int | None = None,
    mission_id: int | None = None,
    field_id: int | None = None,
    analysis_status: str | None = None,
) -> MediaAsset:
    captured_at = datetime.now(timezone.utc)
    asset = MediaAsset(
        user_id=user_id,
        drone_id=drone_id,
        mission_id=mission_id,
        field_id=field_id,
        media_type=media_type,
        file_path=str(file_path),
        captured_at=captured_at,
        expires_at=captured_at + timedelta(days=RETENTION_DAYS),
        analysis_status=analysis_status,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


def purge_expired_media(db: Session) -> int:
    now = datetime.now(timezone.utc)
    expired = db.query(MediaAsset).filter(MediaAsset.expires_at <= now).all()
    removed = 0
    for asset in expired:
        path = Path(asset.file_path)
        if path.exists():
            path.unlink()
        db.delete(asset)
        removed += 1
    if removed:
        db.commit()
    return removed

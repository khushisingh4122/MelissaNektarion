import os
from datetime import datetime, timezone
from pathlib import Path


CAPTURE_DIR = Path(
    os.getenv(
        "CAMERA_CAPTURE_DIR",
        Path(__file__).resolve().parents[3] / "camera_captures",
    )
)
LATEST_IMAGE = CAPTURE_DIR / "latest.jpg"


def capture_image() -> Path:
    """Capture one still image from a Raspberry Pi Camera Module."""
    try:
        from picamera2 import Picamera2
    except ImportError as error:
        raise RuntimeError("Picamera2 is not installed on this Raspberry Pi.") from error

    CAPTURE_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    image_path = CAPTURE_DIR / f"capture_{timestamp}.jpg"
    camera = Picamera2()

    try:
        camera.configure(camera.create_still_configuration())
        camera.start()
        camera.capture_file(str(image_path))
    finally:
        camera.stop()
        camera.close()

    image_path.replace(LATEST_IMAGE)
    return LATEST_IMAGE
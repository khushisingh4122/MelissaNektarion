from pathlib import Path
from datetime import datetime
import os


def capture_image():
    """
    Capture an image using the Raspberry Pi Camera.
    """

    camera = None
    try:
        from picamera2 import Picamera2

        camera = Picamera2()

        camera.configure(
            camera.create_still_configuration()
        )

        camera.start()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        capture_dir = Path(os.getenv("CAMERA_CAPTURE_DIR", Path(__file__).resolve().parent / "captures"))
        capture_dir.mkdir(parents=True, exist_ok=True)
        image_path = capture_dir / f"flower_{timestamp}.jpg"

        camera.capture_file(str(image_path))
        print(f"Image captured: {image_path}")

        return str(image_path)

    except Exception as e:
        print(f"Camera error: {e}")
        return None
    finally:
        if camera is not None:
            try:
                camera.stop()
            except Exception as cleanup_error:
                print(f"Camera cleanup error: {cleanup_error}")


if __name__ == "__main__":
    capture_image()
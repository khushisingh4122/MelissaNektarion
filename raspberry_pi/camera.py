from pathlib import Path
from datetime import datetime


def capture_image():
    """
    Capture an image using the Raspberry Pi Camera.
    """

    try:
        from picamera2 import Picamera2

        camera = Picamera2()

        camera.configure(
            camera.create_still_configuration()
        )

        camera.start()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_path = Path("raspberry_pi") / f"flower_{timestamp}.jpg"

        camera.capture_file(str(image_path))
        camera.stop()

        print(f"Image captured: {image_path}")

        return str(image_path)

    except Exception as e:
        print(f"Camera error: {e}")
        return None


if __name__ == "__main__":
    capture_image()
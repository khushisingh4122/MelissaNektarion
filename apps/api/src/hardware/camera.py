import io
import os
import threading
from datetime import datetime, timezone
from pathlib import Path


CAPTURE_DIR = Path(
    os.getenv(
        "CAMERA_CAPTURE_DIR",
        Path(__file__).resolve().parents[3] / "camera_captures",
    )
)
LATEST_IMAGE = CAPTURE_DIR / "latest.jpg"

# Lower this to (640, 480) if the video is choppy over Wi-Fi.
STREAM_SIZE = (1280, 720)


class StreamBuffer(io.BufferedIOBase):
    """Holds the newest JPEG frame produced by the camera."""

    def __init__(self):
        self.frame = None
        self.condition = threading.Condition()

    def write(self, data):
        with self.condition:
            self.frame = bytes(data)
            self.condition.notify_all()
        return len(data)


_buffer = StreamBuffer()
_camera = None
_start_lock = threading.Lock()


def start_camera():
    """Start the camera once; later calls do nothing."""
    global _camera
    with _start_lock:
        if _camera is not None:
            return
        try:
            from picamera2 import Picamera2
            from picamera2.encoders import MJPEGEncoder
            from picamera2.outputs import FileOutput
        except ImportError as error:
            raise RuntimeError("Picamera2 is not installed on this Raspberry Pi.") from error

        camera = Picamera2()
        camera.configure(camera.create_video_configuration(main={"size": STREAM_SIZE}))
        camera.start_recording(MJPEGEncoder(), FileOutput(_buffer))
        _camera = camera


def stream_frames():
    """Yield frames for a multipart/x-mixed-replace (MJPEG) response."""
    start_camera()
    while True:
        with _buffer.condition:
            _buffer.condition.wait(timeout=5)
            frame = _buffer.frame
        if frame is None:
            continue
        yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"


def capture_image() -> Path:
    """Save the newest frame as a still image (used by capture-and-analyze)."""
    start_camera()
    with _buffer.condition:
        if _buffer.frame is None:
            _buffer.condition.wait(timeout=5)
        frame = _buffer.frame
    if frame is None:
        raise RuntimeError("No camera frame is available yet.")

    CAPTURE_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    (CAPTURE_DIR / f"capture_{timestamp}.jpg").write_bytes(frame)
    LATEST_IMAGE.write_bytes(frame)
    return LATEST_IMAGE
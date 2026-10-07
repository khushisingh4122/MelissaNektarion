from __future__ import annotations

import io
import os
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

try:
    from picamera2 import Picamera2
    from picamera2.encoders import MJPEGEncoder
    from picamera2.outputs import FileOutput
except ImportError:
    Picamera2 = None
    MJPEGEncoder = None
    FileOutput = None

HOST = os.getenv("CAMERA_HOST", "0.0.0.0")
PORT = int(os.getenv("CAMERA_PORT", "8081"))
STREAM_SIZE = (
    int(os.getenv("CAMERA_STREAM_WIDTH", "640")),
    int(os.getenv("CAMERA_STREAM_HEIGHT", "480")),
)


class FrameBuffer(io.BufferedIOBase):
    def __init__(self):
        self.frame = None
        self.condition = threading.Condition()

    def write(self, data):
        with self.condition:
            self.frame = bytes(data)
            self.condition.notify_all()
        return len(data)


buffer = FrameBuffer()
camera = None
camera_lock = threading.Lock()


def start_camera():
    global camera
    if camera is not None:
        return
    if Picamera2 is None:
        raise RuntimeError("Picamera2 is not installed")
    with camera_lock:
        if camera is not None:
            return
        camera = Picamera2()
        camera.configure(camera.create_video_configuration(main={"size": STREAM_SIZE}))
        camera.start_recording(MJPEGEncoder(), FileOutput(buffer))


class CameraHandler(BaseHTTPRequestHandler):
    def send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors()
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        try:
            if path == "/status":
                start_camera()
                self.send_response(200)
                self.send_cors()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(b'{"available":true}')
                return
            if path == "/capture":
                start_camera()
                with buffer.condition:
                    if buffer.frame is None:
                        buffer.condition.wait(timeout=5)
                    image = buffer.frame
                if image is None:
                    raise RuntimeError("No camera frame is available yet")
                self.send_response(200)
                self.send_cors()
                self.send_header("Content-Type", "image/jpeg")
                self.send_header("Content-Length", str(len(image)))
                self.end_headers()
                self.wfile.write(image)
                return
            if path == "/stream":
                start_camera()
                self.send_response(200)
                self.send_cors()
                self.send_header("Content-Type", "multipart/x-mixed-replace; boundary=frame")
                self.end_headers()
                while True:
                    with buffer.condition:
                        buffer.condition.wait(timeout=5)
                        frame = buffer.frame
                    if frame:
                        self.wfile.write(b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")
                return
            self.send_error(404, "Not found")
        except (BrokenPipeError, ConnectionResetError):
            return
        except Exception as error:
            self.send_error(503, str(error))

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    start_camera()
    print(f"Camera server listening on http://0.0.0.0:{PORT}")
    ThreadingHTTPServer((HOST, PORT), CameraHandler).serve_forever()

# Raspberry Pi 3 hardware agent

The Raspberry Pi runs only hardware-facing work. Keep FastAPI, the database, AI models, Groq calls, and the React frontend on the laptop.

## Files to copy to the Pi

- `agent.py`: polls the laptop backend for commands and sends telemetry
- `pixhawk.py`: reads Pixhawk GPS, battery, and speed and sends flight commands
- `camera.py`: captures still images with Picamera2
- `camera_server.py`: serves lightweight live MJPEG video and still captures
- `pollination.py`: required pump control with a safety timeout
- `sensors.py`: reads environmental sensors
- `requirements.txt`: small Python dependency list
- `.env`: Pi-only configuration

## Install on Raspberry Pi OS

```bash
sudo apt update
sudo apt install -y python3-venv python3-picamera2 python3-rpi.gpio
cd ~/melissanektarion/raspberry_pi
python3 -m venv --system-site-packages .venv
. .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env
```

Set `API_BASE_URL` to the laptop's LAN address, not `127.0.0.1`. Use the same `HARDWARE_API_TOKEN` in the laptop backend and this Pi `.env` file. Keep `REQUIRE_PUMP=true`, verify the pump wiring, and confirm the Pixhawk serial device with `ls /dev/ttyACM* /dev/ttyUSB*` before starting the agent.

## Run safely

First test with the Pixhawk connected but motors and propellers disabled:

```bash
. .venv/bin/activate
python agent.py
```

In a second terminal, start the lightweight camera server:

```bash
. .venv/bin/activate
python camera_server.py
```

Set the laptop frontend environment variable before starting the web app:

```env
VITE_PI_CAMERA_URL=http://PI_IP_ADDRESS:8081
```

The dashboard uses the Pi for live video and capture, then sends the captured image to the laptop backend for AI analysis. The browser connects directly to the Pi camera at `VITE_PI_CAMERA_URL`; the camera does not pass through FastAPI. The Pixhawk agent sends telemetry to `API_BASE_URL`, and the dashboard exposes that Pi telemetry through its normal Pixhawk status and telemetry endpoints.

For automatic restart after a process failure, copy `melissa-hardware.service.example` to `/etc/systemd/system/melissa-hardware.service`, update the paths and user if needed, then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now melissa-hardware
journalctl -u melissa-hardware -f
```

Run the camera server as a second service by copying `melissa-camera.service.example` to `/etc/systemd/system/melissa-camera.service`, then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now melissa-camera
```

The Pi should send hardware telemetry to the laptop. It should not run the AI model or the full FastAPI application. The laptop backend must be reachable from the Pi over the local network, and `API_BASE_URL` must use the laptop's LAN IP. The agent fails closed if required GPIO support for the pump is unavailable.

## Camera note

For the lightweight judge demo, run the camera server on the Pi and set `VITE_PI_CAMERA_URL` on the laptop. Do not run the AI model or the full FastAPI application on the Pi.

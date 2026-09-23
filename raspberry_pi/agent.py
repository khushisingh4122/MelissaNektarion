from __future__ import annotations

import json
import os
import time
from urllib import request

from pixhawk import (
    connect_pixhawk,
    get_battery,
    get_gps,
    get_speed,
    land,
    return_home,
    start_mission,
    stop_mission,
    upload_mission,
)
from pollination import set_pump, setup_pump

API_BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
HARDWARE_API_TOKEN = os.getenv("HARDWARE_API_TOKEN", "")
DRONE_ID = int(os.getenv("DRONE_ID", "1"))
PIXHAWK_PORT = os.getenv("PIXHAWK_PORT", "/dev/ttyACM0")
PIXHAWK_BAUD = int(os.getenv("PIXHAWK_BAUD", "115200"))
POLL_SECONDS = float(os.getenv("HARDWARE_POLL_SECONDS", "1"))
LOW_BATTERY_RETURN_HOME = float(os.getenv("LOW_BATTERY_RETURN_HOME", "20"))

active_mission = False
active_zones: list[dict] = []
pump_override: bool | None = None
completed_command_ids: set[str] = set()


def api_json(path: str, method: str = "GET", payload: dict | None = None):
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {"Content-Type": "application/json"} if body else {}
    if HARDWARE_API_TOKEN:
        headers["X-Hardware-Token"] = HARDWARE_API_TOKEN
    request_object = request.Request(f"{API_BASE_URL}{path}", data=body, headers=headers, method=method)
    with request.urlopen(request_object, timeout=5) as response:
        return json.loads(response.read().decode("utf-8"))


def inside_polygon(latitude: float, longitude: float, polygon: list[list[float]]) -> bool:
    inside = False
    previous = len(polygon) - 1
    for index, current in enumerate(polygon):
        current_latitude, current_longitude = current
        previous_latitude, previous_longitude = polygon[previous]
        crosses = (current_longitude > longitude) != (previous_longitude > longitude)
        if crosses:
            boundary_latitude = ((previous_latitude - current_latitude) * (longitude - current_longitude)) / (previous_longitude - current_longitude) + current_latitude
            if latitude < boundary_latitude:
                inside = not inside
        previous = index
    return inside


def in_pollination_zone(gps: dict) -> bool:
    return any(
        zone.get("type") == "pollination"
        and inside_polygon(gps["latitude"], gps["longitude"], zone.get("coordinates", []))
        for zone in active_zones
        if len(zone.get("coordinates", [])) >= 3
    )


def process_commands():
    global active_mission, active_zones, pump_override
    response = api_json(f"/hardware/commands/{DRONE_ID}")
    for command in response.get("commands", []):
        command_id = command["id"]
        if command_id in completed_command_ids:
            api_json(f"/hardware/commands/{DRONE_ID}/ack", "POST", {"command_id": command_id})
            continue
        payload = command.get("payload", {})
        command_type = command.get("type")
        try:
            if command_type == "start_mission":
                upload_mission(payload.get("waypoints", []))
                start_mission()
                active_mission = True
                active_zones = payload.get("pollination_zones", [])
                pump_override = None
            elif command_type == "pump":
                pump_override = bool(payload.get("running", False))
                set_pump(pump_override)
            elif command_type in {"return_home", "stop_mission"}:
                pump_override = False
                set_pump(False)
                active_mission = False
                return_home() if command_type == "return_home" else stop_mission()
            elif command_type == "land":
                pump_override = False
                set_pump(False)
                active_mission = False
                land()
            completed_command_ids.add(command_id)
            if len(completed_command_ids) > 1000:
                completed_command_ids.pop()
            api_json(f"/hardware/commands/{DRONE_ID}/ack", "POST", {"command_id": command_id})
        except Exception as error:
            print(f"Hardware command failed ({command_type}): {error}")


def send_telemetry():
    global active_mission, pump_override
    gps = get_gps()
    battery_data = get_battery()
    speed_data = get_speed()
    connected = gps is not None and battery_data is not None
    if not connected:
        set_pump(False)
        return_home() if active_mission else None
        telemetry = {"connected": False, "internet_connected": True, "camera_available": False}
    else:
        battery = battery_data.get("battery_remaining")
        if active_mission and battery is not None and battery <= LOW_BATTERY_RETURN_HOME:
            set_pump(False)
            return_home()
            active_mission = False
            pump_override = False
        if pump_override is None:
            set_pump(in_pollination_zone(gps))
        telemetry = {
            "connected": True,
            "internet_connected": True,
            "gps": gps,
            "battery": battery,
            "altitude": gps.get("altitude"),
            "speed": speed_data.get("ground_speed") if speed_data else None,
            "camera_available": True,
        }
    api_json(f"/hardware/telemetry/{DRONE_ID}", "POST", telemetry)


def run():
    global active_mission
    setup_pump()
    while True:
        try:
            if connect_pixhawk(PIXHAWK_PORT, PIXHAWK_BAUD):
                while True:
                    process_commands()
                    send_telemetry()
                    time.sleep(POLL_SECONDS)
        except Exception as error:
            print(f"Hardware agent error: {error}")
            set_pump(False)
            if active_mission:
                try:
                    return_home()
                except Exception as failsafe_error:
                    print(f"Local RTL failed: {failsafe_error}")
                active_mission = False
        time.sleep(5)


if __name__ == "__main__":
    run()

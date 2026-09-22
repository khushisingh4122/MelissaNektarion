from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class DroneRuntimeState:
    mission_id: int | None = None
    mission_name: str = ""
    mission_status: str = "idle"
    connected: bool = False
    internet_connected: bool = True
    battery: float = 100.0
    altitude: float = 0.0
    speed: float = 0.0
    gps: dict[str, float] | None = None
    waypoints: list[dict[str, Any]] = field(default_factory=list)
    progress: float = 0.0
    pollination_paused: bool = False
    pollination_motor_running: bool = True
    returning_home: bool = False
    manual_override: bool = False
    last_error: str | None = None

    def snapshot(self) -> dict[str, Any]:
        return {
            "mission_id": self.mission_id,
            "mission_name": self.mission_name,
            "status": self.mission_status,
            "connected": self.connected,
            "internet_connected": self.internet_connected,
            "battery": round(self.battery, 1),
            "altitude": round(self.altitude, 2),
            "speed": round(self.speed, 2),
            "gps": self.gps,
            "waypoints": self.waypoints,
            "progress": round(max(0.0, min(self.progress, 100.0)), 1),
            "pollination_paused": self.pollination_paused,
            "pollination_motor_running": self.pollination_motor_running,
            "returning_home": self.returning_home,
            "manual_override": self.manual_override,
            "last_error": self.last_error,
        }


class DroneRuntime:
    def __init__(self) -> None:
        self.state = DroneRuntimeState()

    def attach_mission(self, mission_id: int | None, mission_name: str, waypoints: list[dict[str, Any]] | None = None) -> dict[str, Any]:
        self.state.mission_id = mission_id
        self.state.mission_name = mission_name
        self.state.waypoints = waypoints or []
        self.state.progress = 0.0
        self.state.pollination_paused = False
        self.state.returning_home = False
        self.state.manual_override = False
        self.state.mission_status = "dispatched"
        self.state.last_error = None
        return self.state.snapshot()

    def update_telemetry(
        self,
        *,
        battery: float | None = None,
        altitude: float | None = None,
        speed: float | None = None,
        gps: dict[str, float] | None = None,
        connected: bool | None = None,
        internet_connected: bool | None = None,
    ) -> dict[str, Any]:
        if battery is not None:
            self.state.battery = battery
        if altitude is not None:
            self.state.altitude = altitude
        if speed is not None:
            self.state.speed = speed
        if gps is not None:
            self.state.gps = gps
        if connected is not None:
            self.state.connected = connected
        if internet_connected is not None:
            self.state.internet_connected = internet_connected

        if self.state.battery <= 20.0 and self.state.mission_status in {"dispatched", "in_mission"}:
            self.state.returning_home = True
            self.state.mission_status = "returning_home"
            self.state.last_error = "Battery low; auto return to home triggered."

        if (not self.state.connected or not self.state.internet_connected) and self.state.mission_status in {"dispatched", "in_mission"}:
            self.state.returning_home = True
            self.state.mission_status = "returning_home"
            self.state.last_error = "Drone connection lost; returning home for safety."

        return self.state.snapshot()

    def set_progress(self, progress: float) -> dict[str, Any]:
        self.state.progress = float(progress)
        if self.state.progress >= 100:
            self.state.mission_status = "completed"
            self.state.returning_home = False
        return self.state.snapshot()

    def pause_pollination(self) -> dict[str, Any]:
        self.state.pollination_paused = True
        self.state.pollination_motor_running = False
        self.state.last_error = "Pollen pump stopped. Drone remains in mission control."
        return self.state.snapshot()

    def resume_pollination(self) -> dict[str, Any]:
        self.state.pollination_paused = False
        self.state.pollination_motor_running = True
        self.state.last_error = None
        return self.state.snapshot()

    def return_home(self) -> dict[str, Any]:
        self.state.returning_home = True
        self.state.mission_status = "returning_home"
        self.state.pollination_paused = True
        self.state.pollination_motor_running = False
        self.state.last_error = "Mission aborted and drone is returning home. Pollen pump stopped."
        return self.state.snapshot()

    def stop_mission(self) -> dict[str, Any]:
        self.state.returning_home = True
        self.state.mission_status = "returning_home"
        self.state.pollination_paused = True
        self.state.pollination_motor_running = False
        self.state.last_error = "Mission stopped by operator. Drone is returning home or landing in a safe area."
        return self.state.snapshot()

    def land_now(self) -> dict[str, Any]:
        self.state.returning_home = False
        self.state.mission_status = "landed"
        self.state.pollination_paused = True
        self.state.pollination_motor_running = False
        self.state.last_error = "Mission stopped and drone has landed safely."
        return self.state.snapshot()

    def set_manual_override(self, enabled: bool) -> dict[str, Any]:
        self.state.manual_override = enabled
        if enabled:
            self.state.last_error = "Manual override engaged."
        else:
            self.state.last_error = None
        return self.state.snapshot()

    def snapshot(self) -> dict[str, Any]:
        return self.state.snapshot()


drone_runtime = DroneRuntime()

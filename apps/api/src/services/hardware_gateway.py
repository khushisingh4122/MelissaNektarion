from __future__ import annotations

from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from threading import Lock
from typing import Any
from uuid import uuid4


@dataclass
class HardwareGateway:
    _commands: dict[int, deque[dict[str, Any]]] = field(default_factory=dict)
    _telemetry: dict[int, dict[str, Any]] = field(default_factory=dict)
    _lock: Lock = field(default_factory=Lock)

    def enqueue(self, drone_id: int, command_type: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        command = {
            "id": str(uuid4()),
            "type": command_type,
            "payload": payload or {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        with self._lock:
            self._commands.setdefault(drone_id, deque()).append(command)
        return command

    def commands_for(self, drone_id: int) -> list[dict[str, Any]]:
        with self._lock:
            return list(self._commands.get(drone_id, ()))

    def acknowledge(self, drone_id: int, command_id: str) -> bool:
        with self._lock:
            commands = self._commands.get(drone_id, deque())
            remaining = deque(command for command in commands if command["id"] != command_id)
            removed = len(remaining) != len(commands)
            self._commands[drone_id] = remaining
            return removed

    def update_telemetry(self, drone_id: int, telemetry: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            self._telemetry[drone_id] = {
                **telemetry,
                "drone_id": drone_id,
                "received_at": datetime.now(timezone.utc).isoformat(),
            }
            return dict(self._telemetry[drone_id])

    def telemetry_for(self, drone_id: int) -> dict[str, Any] | None:
        with self._lock:
            telemetry = self._telemetry.get(drone_id)
            return dict(telemetry) if telemetry else None


hardware_gateway = HardwareGateway()

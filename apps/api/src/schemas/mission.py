from typing import Any

from pydantic import BaseModel, Field


class MissionCreate(BaseModel):
    name: str
    location: str
    drone_id: int
    status: str = Field(default="saved")
    pollination_zones: list[dict[str, Any]] = Field(default_factory=list)
    pesticide_zones: list[dict[str, Any]] = Field(default_factory=list)
    mission_name: str | None = None
    crop: str | None = None
    altitude: float | None = None
    speed: float | None = None
    pattern: str | None = None
    priority: str | None = None
    waypoints: list[dict[str, Any]] = Field(default_factory=list)
    route_distance: float | None = None
    estimated_flight_time: float | None = None


class MissionUpdate(BaseModel):
    status: str
    pollination_zones: list[dict[str, Any]] | None = None
    pesticide_zones: list[dict[str, Any]] | None = None
    mission_name: str | None = None
    crop: str | None = None
    altitude: float | None = None
    speed: float | None = None
    pattern: str | None = None
    priority: str | None = None
    waypoints: list[dict[str, Any]] | None = None
    route_distance: float | None = None
    estimated_flight_time: float | None = None
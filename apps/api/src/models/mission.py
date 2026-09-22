from typing import Any

from sqlalchemy import JSON, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from src.database.base import Base


class Mission(Base):
    __tablename__ = "missions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    location: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="saved"
    )

    drone_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    pollination_zones: Mapped[list[dict[str, Any]] | None] = mapped_column(
        JSON,
        default=list,
        nullable=True,
    )

    pesticide_zones: Mapped[list[dict[str, Any]] | None] = mapped_column(
        JSON,
        default=list,
        nullable=True,
    )

    mission_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    crop: Mapped[str | None] = mapped_column(String(50), nullable=True)
    altitude: Mapped[float | None] = mapped_column(nullable=True)
    speed: Mapped[float | None] = mapped_column(nullable=True)
    pattern: Mapped[str | None] = mapped_column(String(50), nullable=True)
    priority: Mapped[str | None] = mapped_column(String(50), nullable=True)
    waypoints: Mapped[list[dict[str, Any]] | None] = mapped_column(JSON, default=list, nullable=True)
    route_distance: Mapped[float | None] = mapped_column(nullable=True)
    estimated_flight_time: Mapped[float | None] = mapped_column(nullable=True)
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from src.database.base import Base


class TelemetryReading(Base):
    __tablename__ = "telemetry_readings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    drone_id: Mapped[int] = mapped_column(ForeignKey("drones.id"), nullable=False, index=True)
    mission_id: Mapped[int | None] = mapped_column(ForeignKey("missions.id"), nullable=True, index=True)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    connected: Mapped[bool] = mapped_column(default=False)
    battery: Mapped[float | None] = mapped_column(Float, nullable=True)
    altitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    flight_mode: Mapped[str | None] = mapped_column(String(50), nullable=True)
    armed: Mapped[bool | None] = mapped_column(nullable=True)
    gps: Mapped[dict | None] = mapped_column(JSON, nullable=True)

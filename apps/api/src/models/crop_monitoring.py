from sqlalchemy import Integer, String, Float
from sqlalchemy.orm import Mapped, mapped_column

from src.database.base import Base


class CropMonitoring(Base):
    __tablename__ = "crop_monitoring"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    drone_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    mission_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    crop_health: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    health_score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )
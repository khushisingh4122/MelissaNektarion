from sqlalchemy import Integer, String, Float
from sqlalchemy.orm import Mapped, mapped_column

from src.database.base import Base


class PestDetection(Base):
    __tablename__ = "pest_detections"

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

    pest_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )
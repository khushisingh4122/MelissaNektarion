from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from src.database.base import Base


class SensorData(Base):
    __tablename__ = "sensor_data"

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

    sensor_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    value: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )
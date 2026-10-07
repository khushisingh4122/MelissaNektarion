from sqlalchemy import ForeignKey, String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from src.database.base import Base


class Drone(Base):
    __tablename__ = "drones"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    model: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="inactive"
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )

    field_id: Mapped[int | None] = mapped_column(
        ForeignKey("farm_fields.id"), nullable=True, index=True
    )

    hardware_id: Mapped[str | None] = mapped_column(
        String(120), unique=True, nullable=True, index=True
    )
from sqlalchemy import String, Integer
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
        default="pending"
    )

    drone_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )
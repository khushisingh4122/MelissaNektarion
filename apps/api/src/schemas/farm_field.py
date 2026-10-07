from typing import Any

from pydantic import BaseModel, Field


class FarmFieldCreate(BaseModel):
    user_id: int
    name: str
    location: str | None = None
    boundary: list[dict[str, Any]] = Field(default_factory=list)

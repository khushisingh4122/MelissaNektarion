from pydantic import BaseModel


class DroneCreate(BaseModel):
    name: str
    model: str
    user_id: int | None = None
    field_id: int | None = None
    hardware_id: str | None = None


class DroneUpdate(BaseModel):
    status: str
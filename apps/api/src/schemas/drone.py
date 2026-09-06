from pydantic import BaseModel


class DroneCreate(BaseModel):
    name: str
    model: str


class DroneUpdate(BaseModel):
    status: str
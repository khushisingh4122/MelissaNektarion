from pydantic import BaseModel


class MissionCreate(BaseModel):
    name: str
    location: str
    drone_id: int


class MissionUpdate(BaseModel):
    status: str
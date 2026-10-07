from pydantic import BaseModel


class CropMonitoringCreate(BaseModel):
    drone_id: int
    mission_id: int
    crop_health: str
    health_score: float
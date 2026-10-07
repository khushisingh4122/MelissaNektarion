from pydantic import BaseModel


class PestDetectionCreate(BaseModel):
    drone_id: int
    mission_id: int
    pest_name: str
    confidence: float
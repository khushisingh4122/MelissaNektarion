from pydantic import BaseModel


class SensorDataCreate(BaseModel):
    drone_id: int
    mission_id: int
    sensor_type: str
    value: float
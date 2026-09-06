from fastapi import FastAPI

from src.database.base import Base
from src.database.database import engine

from src.models.user import User
from src.models.drone import Drone

from src.api.auth import router as auth_router
from src.api.users import router as users_router
from src.api.drones import router as drones_router
from src.api.missions import router as missions_router
from src.models.mission import Mission
from src.models.sensor_data import SensorData
from src.models.crop_monitoring import CropMonitoring
from src.api.crop_monitoring import router as crop_monitoring_router
from src.api.sensor_data import router as sensor_data_router
from src.models.pest_detection import PestDetection
from src.api.pest_detection import router as pest_detection_router
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(pest_detection_router)
app.include_router(crop_monitoring_router)
app.include_router(sensor_data_router)
app.include_router(missions_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(drones_router)

@app.get("/")
def root():
    return {"message": "MelissaNektarion API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
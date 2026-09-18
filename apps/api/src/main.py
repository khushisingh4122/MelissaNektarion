from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from sqlalchemy import inspect, text

from src.database.base import Base
from src.database.database import engine

from src.models.user import User
from src.models.drone import Drone
from src.models.mission import Mission
from src.models.sensor_data import SensorData
from src.models.crop_monitoring import CropMonitoring
from src.models.pest_detection import PestDetection

from src.api.auth import router as auth_router
from src.api.users import router as users_router
from src.api.drones import router as drones_router
from src.api.missions import router as missions_router
from src.api.sensor_data import router as sensor_data_router
from src.api.crop_monitoring import router as crop_monitoring_router
from src.api.pest_detection import router as pest_detection_router
from src.api.farm_intelligence import router as farm_intelligence_router
from src.api.pollination import router as pollination_router
from src.api.ai import router as ai_router
from src.api.alerts import router as alerts_router
from src.api.pixhawk import router as pixhawk_router


Base.metadata.create_all(bind=engine)

if "phone" not in {column["name"] for column in inspect(engine).get_columns("users")}:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(30)"))

app = FastAPI()

# CORS - allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https?://172\.24\.\d+\.\d+:3000",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pest_detection_router)
app.include_router(farm_intelligence_router)
app.include_router(pollination_router)
app.include_router(ai_router)
app.include_router(alerts_router)
app.include_router(crop_monitoring_router)
app.include_router(sensor_data_router)
app.include_router(missions_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(drones_router)
app.include_router(pixhawk_router)



@app.get("/")
def root():
    return {"message": "MelissaNektarion API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}

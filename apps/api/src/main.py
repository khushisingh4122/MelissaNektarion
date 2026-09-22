from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
from src.api.camera import router as camera_router


Base.metadata.create_all(bind=engine)

try:
	inspector = inspect(engine)
	if "users" in inspector.get_table_names():
		columns = {column["name"] for column in inspector.get_columns("users")}
		if "phone" not in columns:
			with engine.begin() as connection:
				connection.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(30)"))
	if "missions" in inspector.get_table_names():
		mission_columns = {column["name"] for column in inspector.get_columns("missions")}
		mission_migrations = {
			"pollination_zones": "JSON",
			"pesticide_zones": "JSON",
			"mission_name": "VARCHAR(100)",
			"crop": "VARCHAR(50)",
			"altitude": "FLOAT",
			"speed": "FLOAT",
			"pattern": "VARCHAR(50)",
			"priority": "VARCHAR(50)",
			"waypoints": "JSON",
			"route_distance": "FLOAT",
			"estimated_flight_time": "FLOAT",
		}
		with engine.begin() as connection:
			for column_name, column_type in mission_migrations.items():
				if column_name not in mission_columns:
					connection.execute(text(f"ALTER TABLE missions ADD COLUMN {column_name} {column_type}"))
except Exception as error:
	print(f"Database migration warning: {error}")


app = FastAPI(
	title="MelissaNektarion API",
	description="AI Smart Farming and Agricultural Drone API",
	version="1.0.0",
)

app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://localhost:3001",
		"http://127.0.0.1:3001",
	],
	allow_origin_regex=(
		r"https?://("
		r"10\.\d+\.\d+\.\d+"
		r"|172\.(?:1[6-9]|2\d|3[0-1])\.\d+\.\d+"
		r"|192\.168\.\d+\.\d+"
		r"|169\.254\.\d+\.\d+"
		r"):3000"
	),
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

for router in (
	pest_detection_router,
	farm_intelligence_router,
	pollination_router,
	ai_router,
	alerts_router,
	crop_monitoring_router,
	sensor_data_router,
	missions_router,
	auth_router,
	users_router,
	drones_router,
	pixhawk_router,
	camera_router,
):
	app.include_router(router)


@app.get("/")
def root():
	return {"message": "MelissaNektarion API is running", "status": "online", "version": "1.0.0"}


@app.get("/health")
def health_check():
	return {"status": "healthy", "backend": "FastAPI", "project": "MelissaNektarion"}


@app.get("/api/network")
def network_info():
	return {
		"frontend": "http://10.66.199.69:3000",
		"backend": "http://10.66.199.69:8000",
		"docs": "http://10.66.199.69:8000/docs",
		"status": "connected",
	}


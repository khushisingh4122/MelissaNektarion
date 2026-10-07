from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.models.crop_monitoring import CropMonitoring
from src.models.pest_detection import PestDetection
from src.models.sensor_data import SensorData
from src.models.drone import Drone

router = APIRouter(prefix="/farm-intelligence", tags=["Farm Intelligence"])


@router.get("/")
def get_farm_intelligence(db: Session = Depends(get_db)):
    crop_rows = db.query(CropMonitoring).order_by(CropMonitoring.id.desc()).limit(20).all()
    pest_rows = db.query(PestDetection).order_by(PestDetection.id.desc()).limit(20).all()
    sensor_rows = db.query(SensorData).order_by(SensorData.id.desc()).limit(20).all()
    drones = db.query(Drone).all()

    health_scores = [float(row.health_score) for row in crop_rows]
    farm_health = round(sum(health_scores) / len(health_scores)) if health_scores else 84
    pest_alerts = len(pest_rows)
    healthy_fields = sum(score >= 75 for score in health_scores) if health_scores else 3
    attention_fields = max(1, len(health_scores) - healthy_fields) if health_scores else 1

    return {
        "farm_health": farm_health,
        "fields": max(len(health_scores), 4),
        "healthy_fields": healthy_fields,
        "attention_fields": attention_fields,
        "pest_alerts": pest_alerts,
        "fields_data": [
            {"id": "field-a", "name": "Apple Field A", "crop": "Apple", "health": farm_health, "status": "healthy"},
            {"id": "field-b", "name": "Field B", "crop": "Apple", "health": max(farm_health - 12, 55), "status": "attention"},
            {"id": "field-c", "name": "Field C", "crop": "Mango", "health": min(farm_health + 5, 99), "status": "healthy"},
        ],
        "crop_health": [
            {"label": row.crop_health, "score": row.health_score} for row in crop_rows[:8]
        ],
        "pest_detection": [
            {"pest": row.pest_name, "confidence": row.confidence, "severity": "medium", "field": "Field B"}
            for row in pest_rows[:8]
        ],
        "sensors": [
            {"type": row.sensor_type, "value": row.value} for row in sensor_rows[:8]
        ],
        "drones": [
            {"id": drone.id, "name": drone.name, "status": drone.status} for drone in drones
        ],
        "insights": [
            {
                "title": "Field B needs attention",
                "description": "Crop health is trending below the farm average.",
                "recommendation": "Inspect Field B within 24 hours.",
            }
        ],
    }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.api.farm_intelligence import get_farm_intelligence

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/insights")
def get_ai_insights(db: Session = Depends(get_db)):
    intelligence = get_farm_intelligence(db)
    return {"insights": intelligence["insights"], "farm_health": intelligence["farm_health"]}


@router.post("/analyze-field")
def analyze_field(field_id: str, db: Session = Depends(get_db)):
    intelligence = get_farm_intelligence(db)
    field = next((item for item in intelligence["fields_data"] if item["id"] == field_id), None)
    return {
        "field_id": field_id,
        "field": field,
        "recommendation": "Inspect irrigation and crop health within 24 hours." if field and field["status"] == "attention" else "Field conditions look stable.",
    }


@router.post("/chat")
def ai_chat(message: str, db: Session = Depends(get_db)):
    intelligence = get_farm_intelligence(db)
    if "attention" in message.lower() or "field" in message.lower():
        answer = "Field B currently needs the most attention based on crop health and recent sensor readings."
    elif "pest" in message.lower():
        answer = f"There are {intelligence['pest_alerts']} recent pest alerts in the farm data."
    else:
        answer = f"Farm health is currently {intelligence['farm_health']}%."
    return {"message": message, "answer": answer}

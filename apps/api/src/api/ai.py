import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.database.database import get_db
from src.api.farm_intelligence import get_farm_intelligence

router = APIRouter(prefix="/ai", tags=["AI"])

PRODUCT_CONTEXT = """
You are the MelissaNektarion AI assistant for an orchard drone and crop monitoring system.
The system includes:
- Raspberry Pi 4 edge computer
- Raspberry Pi Camera V2
- Pixhawk flight controller
- GPS positioning
- crop disease and pest detection
- pollination mission planning
- drone monitoring dashboard
- manual override control and safety return-to-home behavior

Core product purpose:
- plan drone missions over orchard fields
- monitor drone status live
- capture field images with the Raspberry Pi camera
- analyze crop health, disease, and pest risk
- detect apple flowers and pollination targets
- pause or resume pollination when needed
- return the drone home safely if connectivity or battery becomes critical

When answering, explain the system in practical terms for farmers and drone operators.
Do not claim to fly the drone physically unless the pilot has connected a real controller.
"""


class ChatRequest(BaseModel):
    message: str


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
def ai_chat(payload: ChatRequest, db: Session = Depends(get_db)):
    message = payload.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Please provide a message.")

    intelligence = get_farm_intelligence(db)
    lower = message.lower()

    if any(word in lower for word in ["how", "what", "work", "system", "project"]):
        answer = (
            "MelissaNektarion is an orchard drone and smart farming system. "
            "It plans field missions, captures images with the Raspberry Pi camera, "
            "tracks Pixhawk GPS and battery telemetry, and runs AI analysis for crop health, "
            "apple flowers, disease, and pests."
        )
    elif any(word in lower for word in ["pollination", "pollen", "flower", "apple"]):
        answer = (
            "The pollination workflow starts with a mission route over the orchard, then the drone scans flowers with the camera. "
            "The apple detection model identifies flowers and buds, and the system decides which areas are ready for pollination. "
            "The operator can pause or resume pollination, and the drone will return home safely if connectivity or battery becomes critical."
        )
    elif any(word in lower for word in ["pixhawk", "gps", "battery", "drone"]):
        answer = (
            "The drone is monitored through Pixhawk telemetry and GPS. The Raspberry Pi 4 handles camera capture and the backend collects the live data, "
            "while the frontend dashboard shows battery, altitude, speed, and location."
        )
    elif any(word in lower for word in ["disease", "pest", "crop health", "health"]):
        answer = (
            f"The current farm health is about {intelligence['farm_health']}%. "
            f"The crop intelligence layer analyzes images and marks likely disease or pest risk so the operator can inspect the field and decide on action."
        )
    elif any(word in lower for word in ["return home", "safety", "fail", "disconnect", "lost connection"]):
        answer = (
            "Yes. The drone is designed to be safety-first. If the connection is lost or battery drops too low, it should stop the mission and return home before continuing."
        )
    else:
        answer = (
            f"Farm health is currently {intelligence['farm_health']}%, and the system is designed to combine drone telemetry, crop AI, and pollination missions into one orchard management workflow."
        )

    try:
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            from groq import Groq

            client = Groq(api_key=api_key)
            response = client.chat.completions.create(
                model=os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
                temperature=0.2,
                max_tokens=250,
                messages=[
                    {"role": "system", "content": PRODUCT_CONTEXT},
                    {"role": "user", "content": message},
                ],
            )
            answer = response.choices[0].message.content.strip() or answer
    except Exception:
        pass

    return {"message": message, "answer": answer}

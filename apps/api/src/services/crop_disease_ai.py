import os
import base64
import mimetypes
from pathlib import Path


GUIDANCE = {
    "healthy": {
        "category": "healthy",
        "solution": "No disease or pest was detected. Continue balanced irrigation, nutrition, and routine crop monitoring.",
        "prevention": "Inspect leaves regularly, remove plant debris, and maintain good airflow through the crop.",
        "precautions": "Do not apply pesticides to a healthy crop based only on an image result.",
    },
    "apple_scab": {
        "category": "disease",
        "solution": "Remove and dispose of affected leaves and fruit, improve canopy airflow, and ask an agronomist about an approved fungicide.",
        "prevention": "Clear fallen leaves and fruit, avoid overhead irrigation, and keep foliage dry when possible.",
        "precautions": "Do not eat visibly affected fruit or apply fungicide without checking the product label and local guidance.",
    },
    "powdery_mildew": {
        "category": "disease",
        "solution": "Prune heavily affected growth, reduce excess humidity, and consult an agronomist about an approved treatment.",
        "prevention": "Improve spacing and airflow, avoid excessive nitrogen, and monitor new growth frequently.",
        "precautions": "Avoid handling or treating affected plants without protective equipment required by the product label.",
    },
    "aphid": {
        "category": "pest",
        "solution": "Isolate heavily affected growth, wash small infestations off with water, and use an approved control after expert confirmation.",
        "prevention": "Inspect the underside of leaves, control weeds around the crop, and encourage beneficial insects.",
        "precautions": "Avoid broad-spectrum pesticides during flowering because they can harm pollinators.",
    },
    "whitefly": {
        "category": "pest",
        "solution": "Remove badly affected leaves, use monitoring traps, and ask an agronomist about an approved whitefly control.",
        "prevention": "Check leaf undersides regularly, remove weeds, and use insect screens or traps where appropriate.",
        "precautions": "Do not spray during pollinator activity and follow the product label, harvest interval, and protective-equipment guidance.",
    },
}

DEFAULT_GUIDANCE = {
    "category": "unknown",
    "solution": "Isolate visibly affected plants, capture a closer well-lit image, and consult a local agronomist for confirmation.",
    "prevention": "Continue regular scouting and remove plant debris while the finding is being confirmed.",
    "precautions": "Do not apply chemicals based only on an image result. Follow local agricultural guidance and product labels.",
}


def guidance_for(label: str) -> dict:
    normalized_label = label.strip().lower().replace(" ", "_").replace("-", "_")
    return GUIDANCE.get(normalized_label, DEFAULT_GUIDANCE)


def build_detection(label: str, confidence: float) -> dict:
    guidance = guidance_for(label)
    return {
        "disease": label,
        "category": guidance["category"],
        "confidence": round(confidence, 1),
        "solution": guidance["solution"],
        "prevention": guidance["prevention"],
        "precautions": guidance["precautions"],
    }


def top_level_guidance(detections: list[dict]) -> dict:
    return {
        "prevention": " ".join(dict.fromkeys(item["prevention"] for item in detections)),
        "precautions": " ".join(dict.fromkeys(item["precautions"] for item in detections)),
    }


def analyze_image(image_path: Path, analysis_focus: str = "complete") -> dict:
    allowed_focuses = {"complete", "crop", "disease", "pest", "prevention"}
    if analysis_focus not in allowed_focuses:
        analysis_focus = "complete"

    model_path = os.getenv("CROP_DISEASE_MODEL_PATH")
    if not model_path:
        vision = groq_vision_analysis(image_path, analysis_focus)
        if vision:
            return {"status": "analyzed_by_groq", **vision}
        return {
            "status": "model_not_configured",
            "message": "No local model is configured and the Groq vision request failed. Check GROQ_API_KEY, GROQ_VISION_MODEL, and network access, then restart the backend.",
            "disease": None,
            "confidence": None,
            "solution": None,
        }

    model_file = Path(model_path)
    if not model_file.is_absolute():
        model_file = Path(__file__).resolve().parents[4] / model_file
    if not model_file.exists():
        vision = groq_vision_analysis(image_path, analysis_focus)
        if vision:
            return {"status": "analyzed_by_groq", **vision}
        return {
            "status": "model_unavailable",
            "message": f"The local model was not found and Groq vision was unavailable. Check GROQ_API_KEY and GROQ_VISION_MODEL. Missing local file: {model_file}",
            "disease": None,
            "confidence": None,
            "solution": None,
        }

    try:
        from ultralytics import YOLO
    except ImportError as error:
        raise RuntimeError(
            "Install ultralytics to run the configured crop disease model."
        ) from error

    model = YOLO(str(model_file))
    # Keep the strongest candidate visible for the demo model; the one-epoch
    # weights produce low-confidence boxes that should be treated as tentative.
    results = model.predict(source=str(image_path), conf=0.001, max_det=1, verbose=False)
    result = results[0]
    if result.probs is not None:
        class_id = int(result.probs.top1)
        confidence = float(result.probs.top1conf)
        disease = result.names[class_id]
        detection = build_detection(disease, confidence * 100)
        return {
            "status": "analyzed",
            "disease": detection["disease"],
            "category": detection["category"],
            "confidence": detection["confidence"],
            "solution": detection["solution"],
            "detections": [detection],
            **top_level_guidance([detection]),
            **llm_guidance([detection], detection["solution"]),
        }

    detections = []
    if result.boxes is not None:
        for class_id, confidence in zip(result.boxes.cls, result.boxes.conf):
            name = result.names[int(class_id)]
            detections.append(build_detection(name, float(confidence) * 100))
    fallback = detections[0]["solution"] if detections else "No clear disease or pest was detected. Capture a closer, well-lit image and monitor the crop."
    if not detections:
        vision = groq_vision_analysis(image_path, analysis_focus)
        if vision:
            return {"status": "analyzed_by_groq", **vision}
    return {
        "status": "analyzed",
        "detections": detections,
        **(top_level_guidance(detections) if detections else {}),
        **llm_guidance(
            [{"disease": item["disease"], "confidence": item["confidence"]} for item in detections],
            fallback,
        ),
    }


def analyze_frame(image_path: Path) -> dict:
    """Run the same model contract for a Raspberry Pi or drone camera frame."""
    return analyze_image(image_path)


def llm_guidance(findings: list[dict], fallback: str) -> dict:
    """Ask Groq for farmer-friendly guidance without exposing the uploaded image."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {
            "ai_advice": fallback,
            "advice_source": "local guidance",
        }

    try:
        from groq import Groq

        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
            temperature=0.2,
            max_tokens=220,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a careful agricultural support assistant. Explain computer-vision findings "
                        "in plain language. Give 2 or 3 practical next steps, avoid exact pesticide dosage, "
                        "and tell the farmer to confirm serious disease with a local agronomist."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Model findings: {findings}. Provide a short explanation and safe next steps.",
                },
            ],
        )
        advice = response.choices[0].message.content.strip()
        return {
            "ai_advice": advice,
            "advice_source": "Groq agricultural assistant",
        }
    except Exception:
        return {
            "ai_advice": fallback,
            "advice_source": "local guidance",
        }


def groq_vision_analysis(image_path: Path, analysis_focus: str = "complete") -> dict | None:
    """Use Groq vision as a fallback when the trained detector finds nothing."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None

    try:
        from groq import Groq

        mime_type = mimetypes.guess_type(image_path.name)[0] or "image/jpeg"
        image_data = base64.b64encode(image_path.read_bytes()).decode("ascii")
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=os.getenv("GROQ_VISION_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct"),
            temperature=0.1,
            max_tokens=350,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                f"Inspect this crop image with focus on {analysis_focus}. Identify the crop when possible, "
                                "then assess disease, pest, prevention, and next step as relevant. "
                                "Return concise sections exactly named: Crop, Finding, Confidence, Prevention, Precautions, Next step. "
                                "If the image is unclear, say Uncertain and explain what photo is needed. Do not give pesticide dosage."
                            ),
                        },
                        {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{image_data}"}},
                    ],
                }
            ],
        )
        advice = response.choices[0].message.content.strip()
        return {
            "disease": "Groq vision assessment",
            "confidence": None,
            "solution": advice,
            "ai_advice": advice,
            "prevention": "Follow the prevention guidance in the Groq assessment and verify with a local agronomist.",
            "precautions": "Do not apply chemicals based only on an image. Isolate visibly affected plants and confirm the diagnosis.",
            "advice_source": "Groq vision fallback",
        }
    except Exception:
        return None
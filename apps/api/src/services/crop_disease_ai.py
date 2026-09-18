import os
from pathlib import Path


def analyze_image(image_path: Path) -> dict:
    model_path = os.getenv("CROP_DISEASE_MODEL_PATH")
    if not model_path:
        return {
            "status": "model_not_configured",
            "message": "Configure CROP_DISEASE_MODEL_PATH with a trained crop disease model.",
            "disease": None,
            "confidence": None,
            "solution": None,
        }

    model_file = Path(model_path)
    if not model_file.exists():
        return {
            "status": "model_unavailable",
            "message": f"The configured disease model was not found: {model_file}",
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
    results = model.predict(source=str(image_path), conf=0.35, verbose=False)
    result = results[0]
    if result.probs is not None:
        class_id = int(result.probs.top1)
        confidence = float(result.probs.top1conf)
        disease = result.names[class_id]
        return {
            "status": "analyzed",
            "disease": disease,
            "confidence": round(confidence * 100, 1),
            "solution": solution_for(disease),
        }

    detections = []
    if result.boxes is not None:
        for class_id, confidence in zip(result.boxes.cls, result.boxes.conf):
            name = result.names[int(class_id)]
            detections.append({
                "disease": name,
                "confidence": round(float(confidence) * 100, 1),
                "solution": solution_for(name),
            })
    return {"status": "analyzed", "detections": detections}


def analyze_frame(image_path: Path) -> dict:
    """Run the same model contract for a Raspberry Pi or drone camera frame."""
    return analyze_image(image_path)


def solution_for(disease: str) -> str:
    recommendations = {
        "healthy": "No disease detected. Continue regular monitoring and balanced irrigation.",
        "apple_scab": "Remove affected leaves, improve airflow, and consult a local agronomist about an approved fungicide.",
        "powdery_mildew": "Prune affected growth, reduce excess humidity, and use an approved treatment after expert guidance.",
    }
    return recommendations.get(
        disease.lower(),
        "Isolate affected plants and consult a local agronomist before applying treatment.",
    )
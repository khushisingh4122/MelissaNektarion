import os
import base64
import mimetypes
from pathlib import Path


def analyze_image(image_path: Path) -> dict:
    model_path = os.getenv("CROP_DISEASE_MODEL_PATH")
    if not model_path:
        vision = groq_vision_analysis(image_path)
        if vision:
            return {"status": "analyzed_by_groq", **vision}
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
        local_solution = solution_for(disease)
        return {
            "status": "analyzed",
            "disease": disease,
            "confidence": round(confidence * 100, 1),
            "solution": local_solution,
            **llm_guidance([{"disease": disease, "confidence": round(confidence * 100, 1)}], local_solution),
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
    fallback = detections[0]["solution"] if detections else "No clear disease or pest was detected. Capture a closer, well-lit image and monitor the crop."
    if not detections:
        vision = groq_vision_analysis(image_path)
        if vision:
            return {"status": "analyzed_by_groq", **vision}
    return {
        "status": "analyzed",
        "detections": detections,
        **llm_guidance(
            [{"disease": item["disease"], "confidence": item["confidence"]} for item in detections],
            fallback,
        ),
    }


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


def groq_vision_analysis(image_path: Path) -> dict | None:
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
                                "Inspect this crop image. Identify the most likely crop, disease, pest, or healthy condition. "
                                "Return concise sections exactly named: Finding, Confidence, Prevention, Precautions, Next step. "
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
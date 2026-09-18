from ultralytics import YOLO
from pathlib import Path
import json
import sys



MODEL_PATH = Path(
    r"D:\melisa\apple_training\runs\apple_model\weights\best.pt"
)

CONFIDENCE = 0.40

CLASS_NAMES = {
    0: "apple_flower",
    1: "bud"
}


def detect_image(image_path):
    """
    Run Apple Flower/Bud detection on one image.

    Returns a dictionary containing:
    - image path
    - detected objects
    - class
    - confidence
    - bounding box
    """

    image_path = Path(image_path)

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )

    if not image_path.exists():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    # Load trained YOLO model
    model = YOLO(str(MODEL_PATH))

    # Run detection
    results = model.predict(
        source=str(image_path),
        conf=CONFIDENCE,
        verbose=False
    )

    result = results[0]

    detections = []

    if result.boxes is not None:
        boxes = result.boxes

        for i in range(len(boxes)):
            class_id = int(boxes.cls[i].item())
            confidence = float(boxes.conf[i].item())

            x1, y1, x2, y2 = boxes.xyxy[i].tolist()

            detection = {
                "class_id": class_id,
                "class_name": CLASS_NAMES.get(
                    class_id,
                    "unknown"
                ),
                "confidence": round(
                    confidence,
                    4
                ),
                "bounding_box": {
                    "x1": round(x1, 2),
                    "y1": round(y1, 2),
                    "x2": round(x2, 2),
                    "y2": round(y2, 2)
                }
            }

            detections.append(detection)

    # Count detections
    flower_count = sum(
        1
        for d in detections
        if d["class_name"] == "apple_flower"
    )

    bud_count = sum(
        1
        for d in detections
        if d["class_name"] == "bud"
    )

    output = {
        "crop": "apple",
        "image": str(image_path),
        "total_detections": len(detections),
        "apple_flower_count": flower_count,
        "bud_count": bud_count,
        "detections": detections
    }

    return output


def main():
    # Default test image
    default_image = (
        r"D:\melisa\apple_training\images\test\IMG_0044.jpg"
    )

    # Allow image path from command line
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        image_path = default_image

    try:
        output = detect_image(image_path)

        print("\n====================================")
        print("APPLE AI DETECTION RESULT")
        print("====================================")

        print(
            f"Crop: {output['crop']}"
        )

        print(
            f"Total detections: "
            f"{output['total_detections']}"
        )

        print(
            f"Apple flowers: "
            f"{output['apple_flower_count']}"
        )

        print(
            f"Buds: "
            f"{output['bud_count']}"
        )

        print("\nDetections:")

        for number, detection in enumerate(
            output["detections"],
            start=1
        ):
            print(
                f"{number}. "
                f"{detection['class_name']} "
                f"(confidence="
                f"{detection['confidence']}) "
                f"bbox="
                f"{detection['bounding_box']}"
            )

        print("\nJSON:")
        print(
            json.dumps(
                output,
                indent=2
            )
        )

    except Exception as error:
        print(
            f"\nERROR: {error}"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
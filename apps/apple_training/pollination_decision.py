from apps.apple_training.apple_detector import detect_image
from pathlib import Path
import json
import sys




FLOWER_CONFIDENCE_THRESHOLD = 0.50


def make_pollination_decision(detection_result):
    """
    Convert flower detections into potential pollination targets.

    Prototype rules:
    - Only apple flowers can become targets.
    - Buds are ignored.
    - Apple flower confidence must be >= 0.50.
    """

    targets = []
    ignored_detections = []

    for detection in detection_result["detections"]:

        class_name = detection["class_name"]
        confidence = detection["confidence"]

        if (
            class_name == "apple_flower"
            and confidence >= FLOWER_CONFIDENCE_THRESHOLD
        ):
            targets.append(
                {
                    "target_id": len(targets) + 1,
                    "target_type": "apple_flower",
                    "confidence": confidence,
                    "bounding_box": detection["bounding_box"],
                    "decision": "potential_pollination_target",
                }
            )

        else:
            ignored_detections.append(
                {
                    "class_name": class_name,
                    "confidence": confidence,
                    "bounding_box": detection["bounding_box"],
                    "decision": "ignored",
                }
            )

    result = {
        "crop": detection_result["crop"],
        "flower_confidence_threshold": FLOWER_CONFIDENCE_THRESHOLD,
        "total_detections": detection_result["total_detections"],
        "potential_pollination_targets": len(targets),
        "targets": targets,
        "ignored_detections": ignored_detections,
    }

    return result


def main():

    default_image = (
        r"D:\melisa\apple_training\images\test\IMG_0044.jpg"
    )

    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        image_path = default_image

    image_path = Path(image_path)

    try:

        print("\nRunning Apple Flower Detection...")
        detection_result = detect_image(image_path)

        print("Running Pollination Decision...")

        decision_result = make_pollination_decision(
            detection_result
        )

        print("\n====================================")
        print("POLLINATION DECISION RESULT")
        print("====================================")

        print(
            f"Crop: {decision_result['crop']}"
        )

        print(
            f"Total detections: "
            f"{decision_result['total_detections']}"
        )

        print(
            f"Confidence threshold: "
            f"{decision_result['flower_confidence_threshold']}"
        )

        print(
            f"Potential pollination targets: "
            f"{decision_result['potential_pollination_targets']}"
        )

        print("\nTARGETS:")

        if not decision_result["targets"]:
            print("No potential targets found.")

        else:

            for target in decision_result["targets"]:

                print(
                    f"Target {target['target_id']}: "
                    f"{target['target_type']} | "
                    f"confidence="
                    f"{target['confidence']} | "
                    f"bbox="
                    f"{target['bounding_box']}"
                )

        print("\nJSON RESULT:")

        print(
            json.dumps(
                decision_result,
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
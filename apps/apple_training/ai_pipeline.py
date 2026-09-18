from apps.apple_training.apple_detector import detect_image
from apps.apple_training.pollination_decision import make_pollination_decision
from pathlib import Path
import json
import sys


# ---------------------------------------------------------
# MelissaNektarion AI Pipeline
# Apple Flower Detection + Pollination Decision
# ---------------------------------------------------------

DEFAULT_IMAGE = (
    r"D:\melisa\apple_training\images\test\IMG_0044.jpg"
)


def run_ai_pipeline(image_path):
    """
    Complete AI pipeline:

    1. Detect apple flowers and buds
    2. Apply pollination decision rules
    3. Return final AI result
    """

    image_path = Path(image_path)

    # -----------------------------------------------------
    # STEP 1: AI DETECTION
    # -----------------------------------------------------

    print("\nRunning Apple Flower Detection...")

    detection_result = detect_image(image_path)

    # -----------------------------------------------------
    # STEP 2: POLLINATION DECISION
    # -----------------------------------------------------

    print("Running Pollination Decision...")

    decision_result = make_pollination_decision(
        detection_result
    )

    # -----------------------------------------------------
    # COMBINE RESULTS
    # -----------------------------------------------------

    final_result = {
        "crop": decision_result["crop"],

        "image": str(image_path),

        "total_detections": decision_result[
            "total_detections"
        ],

        "apple_flower_count": sum(
            1
            for detection in detection_result["detections"]
            if detection["class_name"] == "apple_flower"
        ),

        "bud_count": sum(
            1
            for detection in detection_result["detections"]
            if detection["class_name"] == "bud"
        ),

        "flower_confidence_threshold": decision_result[
            "flower_confidence_threshold"
        ],

        "potential_pollination_targets": decision_result[
            "potential_pollination_targets"
        ],

        "targets": decision_result["targets"],

        "ignored_detections": decision_result[
            "ignored_detections"
        ],

        "status": "AI_ANALYSIS_COMPLETE"
    }

    return final_result


def main():

    # -----------------------------------------------------
    # IMAGE SELECTION
    # -----------------------------------------------------

    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        image_path = DEFAULT_IMAGE

    try:

        # -------------------------------------------------
        # RUN COMPLETE PIPELINE
        # -------------------------------------------------

        result = run_ai_pipeline(image_path)

        # -------------------------------------------------
        # DISPLAY RESULT
        # -------------------------------------------------

        print("\n====================================")
        print("MELISSANEKTARION AI PIPELINE")
        print("====================================")

        print(
            f"Crop: {result['crop']}"
        )

        print(
            f"Image: {result['image']}"
        )

        print("\nDetection Results")
        print("-----------------")

        print(
            f"Total detections: "
            f"{result['total_detections']}"
        )

        print(
            f"Apple flowers: "
            f"{result['apple_flower_count']}"
        )

        print(
            f"Buds: "
            f"{result['bud_count']}"
        )

        print("\nPollination Decision")
        print("--------------------")

        print(
            f"Confidence threshold: "
            f"{result['flower_confidence_threshold']}"
        )

        print(
            f"Potential pollination targets: "
            f"{result['potential_pollination_targets']}"
        )

        print(
            f"Status: "
            f"{result['status']}"
        )

        # -------------------------------------------------
        # TARGETS
        # -------------------------------------------------

        print("\nPotential Targets")
        print("-----------------")

        if not result["targets"]:

            print(
                "No potential pollination targets found."
            )

        else:

            for target in result["targets"]:

                print(
                    f"Target {target['target_id']}: "
                    f"{target['target_type']} | "
                    f"confidence="
                    f"{target['confidence']} | "
                    f"bbox="
                    f"{target['bounding_box']}"
                )

        # -------------------------------------------------
        # FINAL JSON
        # -------------------------------------------------

        print("\n====================================")
        print("FINAL AI JSON")
        print("====================================")

        print(
            json.dumps(
                result,
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
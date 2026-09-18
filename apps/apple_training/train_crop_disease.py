from pathlib import Path

ROOT = Path(__file__).parent
DATASET = ROOT / "datasets" / "apple_crop_health"
DATA_CONFIG = ROOT / "crop_disease.yaml"


def validate_dataset() -> None:
    required = [
        DATASET / "images" / "train",
        DATASET / "images" / "val",
        DATASET / "labels" / "train",
        DATASET / "labels" / "val",
    ]
    missing = [str(path) for path in required if not path.is_dir()]
    if missing:
        raise FileNotFoundError(
            "Create the labeled dataset folders before training:\n" + "\n".join(missing)
        )


def main() -> None:
    validate_dataset()
    from ultralytics import YOLO

    model = YOLO("yolo11n.pt")
    model.train(
        data=str(DATA_CONFIG),
        epochs=100,
        imgsz=640,
        batch=-1,
        patience=20,
        project=str(ROOT / "runs"),
        name="crop_disease_pest",
        pretrained=True,
    )


if __name__ == "__main__":
    main()
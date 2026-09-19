from pathlib import Path
import argparse

ROOT = Path(__file__).parent
DATASET = ROOT / "datasets" / "apple_crop_health"
DATA_CONFIG = DATASET / "data.yaml"


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
    parser = argparse.ArgumentParser(description="Train the multi-crop disease and pest detector.")
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=-1)
    parser.add_argument("--name", default="multi_crop_disease_pest")
    args = parser.parse_args()

    validate_dataset()
    from ultralytics import YOLO

    model = YOLO("yolo11n.pt")
    model.train(
        data=str(DATA_CONFIG),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        patience=20,
        project=str(ROOT / "runs"),
        name=args.name,
        pretrained=True,
    )


if __name__ == "__main__":
    main()
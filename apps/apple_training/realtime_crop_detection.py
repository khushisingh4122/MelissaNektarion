import argparse

from ultralytics import YOLO


def main() -> None:
    parser = argparse.ArgumentParser(description="Run crop disease/pest detection on a camera source.")
    parser.add_argument("--model", required=True, help="Path to trained crop disease .pt weights")
    parser.add_argument("--source", default="0", help="Camera index, video file, or RTSP URL")
    parser.add_argument("--confidence", type=float, default=0.45)
    args = parser.parse_args()

    source = int(args.source) if args.source.isdigit() else args.source
    model = YOLO(args.model)
    model.predict(source=source, conf=args.confidence, show=True, stream=True, verbose=False)


if __name__ == "__main__":
    main()
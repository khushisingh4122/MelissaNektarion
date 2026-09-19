import shutil
from pathlib import Path


ROOT = Path(__file__).parent
SOURCE = ROOT / "datasets" / "apple_crop_health"
DEMO = ROOT / "datasets" / "crop_demo"


def main() -> None:
    source_images = SOURCE / "images" / "train"
    source_labels = SOURCE / "labels" / "train"
    demo_images = DEMO / "images" / "train"
    demo_labels = DEMO / "labels" / "train"
    demo_val_images = DEMO / "images" / "val"
    demo_val_labels = DEMO / "labels" / "val"

    for directory in (demo_images, demo_labels, demo_val_images, demo_val_labels):
        directory.mkdir(parents=True, exist_ok=True)

    selected = []
    class_ids = set()
    for image_path in sorted(source_images.iterdir()):
        label_path = source_labels / f"{image_path.stem}.txt"
        if not label_path.exists() or not label_path.read_text(encoding="utf-8").strip():
            continue
        labels = label_path.read_text(encoding="utf-8").splitlines()
        image_classes = {line.split()[0] for line in labels if line.split()}
        if image_classes - class_ids or len(selected) < 1:
            selected.append((image_path, label_path))
            class_ids.update(image_classes)
        if len(selected) == 3:
            break

    if len(selected) < 3:
        raise RuntimeError("Could not find three labeled images in the prepared dataset.")

    for image_path, label_path in selected[:2]:
        shutil.copy2(image_path, demo_images / image_path.name)
        shutil.copy2(label_path, demo_labels / label_path.name)
    shutil.copy2(selected[2][0], demo_val_images / selected[2][0].name)
    shutil.copy2(selected[2][1], demo_val_labels / selected[2][1].name)

    source_config = SOURCE / "data.yaml"
    config = source_config.read_text(encoding="utf-8")
    config = config.replace(f"path: {SOURCE.resolve()}", f"path: {DEMO.resolve()}")
    (DEMO / "data.yaml").write_text(config, encoding="utf-8")
    print(f"Prepared demo dataset with {len(selected)} images at {DEMO}")


if __name__ == "__main__":
    main()
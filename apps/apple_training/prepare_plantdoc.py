import hashlib
import subprocess
from pathlib import Path


ROOT = Path(__file__).parent
REPO = ROOT / "datasets" / "plantdoc_raw"
OUTPUT = ROOT / "datasets" / "apple_crop_health"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
TARGET_CLASSES = {
    "Apple leaf": "healthy",
    "Apple Scab Leaf": "apple_scab",
    "Squash Powdery mildew leaf": "powdery_mildew",
    "Tomato two spotted spider mites leaf": "spider_mites",
}


def git_tree() -> list[str]:
    output = subprocess.check_output(
        ["git", "-C", str(REPO), "ls-tree", "-r", "--name-only", "HEAD"],
        text=True,
    )
    return output.splitlines()


def blob_hash(path: str) -> str:
    output = subprocess.check_output(
        ["git", "-C", str(REPO), "ls-tree", "HEAD", "--", path],
        text=True,
    )
    return output.split()[2]


def read_blob(object_hash: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(REPO), "cat-file", "blob", object_hash])


def safe_name(source_path: str) -> str:
    suffix = Path(source_path).suffix.lower()
    digest = hashlib.sha1(source_path.encode()).hexdigest()[:16]
    return f"image_{digest}{suffix}"


def main() -> None:
    if not (REPO / ".git").is_dir():
        raise FileNotFoundError(f"Clone PlantDoc first into {REPO}")

    image_paths = [
        path for path in git_tree()
        if path.startswith(("train/", "test/"))
        and path.split("/", 2)[1] in TARGET_CLASSES
        and Path(path).suffix.lower() in IMAGE_EXTENSIONS
    ]
    class_names = sorted({TARGET_CLASSES[path.split("/", 2)[1]] for path in image_paths})
    class_ids = {name: index for index, name in enumerate(class_names)}

    if not image_paths:
        raise RuntimeError("No PlantDoc images were found in train/ or test/.")

    for split in ("train", "val"):
        for directory in (OUTPUT / "images" / split, OUTPUT / "labels" / split):
            directory.mkdir(parents=True, exist_ok=True)
            for file_path in directory.iterdir():
                if file_path.is_file():
                    file_path.unlink()

    for split, source_prefix in (("train", "train/"), ("val", "test/")):
        image_output = OUTPUT / "images" / split
        label_output = OUTPUT / "labels" / split
        for image_path in (path for path in image_paths if path.startswith(source_prefix)):
            class_name = TARGET_CLASSES[image_path.split("/", 2)[1]]
            filename = safe_name(image_path)
            (image_output / filename).write_bytes(read_blob(blob_hash(image_path)))
            (label_output / f"{Path(filename).stem}.txt").write_text(
                f"{class_ids[class_name]} 0.5 0.5 1.0 1.0\n",
                encoding="utf-8",
            )

    config_lines = [
        f"path: {OUTPUT.resolve()}",
        "train: images/train",
        "val: images/val",
        "names:",
    ]
    config_lines.extend(f"  {class_id}: {name}" for name, class_id in class_ids.items())
    (OUTPUT / "data.yaml").write_text("\n".join(config_lines) + "\n", encoding="utf-8")
    print(f"Prepared {len(image_paths)} images and {len(class_ids)} classes in {OUTPUT}")


if __name__ == "__main__":
    main()

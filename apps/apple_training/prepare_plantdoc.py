import hashlib
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path


ROOT = Path(__file__).parent
REPO = ROOT / "datasets" / "plantdoc_raw"
OUTPUT = ROOT / "datasets" / "apple_crop_health"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def git_tree() -> dict[str, str]:
    output = subprocess.check_output(
        ["git", "-C", str(REPO), "ls-tree", "-r", "-z", "HEAD"],
    )
    entries = {}
    for entry in output.split(b"\0"):
        if not entry:
            continue
        metadata, path_bytes = entry.split(b"\t", 1)
        object_hash = metadata.split()[2].decode()
        entries[path_bytes.decode("utf-8", errors="replace")] = object_hash
    return entries


def read_blob(object_hash: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(REPO), "cat-file", "blob", object_hash])


def safe_name(source_path: str) -> str:
    original = Path(source_path).name
    stem = Path(original).stem
    suffix = Path(original).suffix.lower()
    clean_stem = "".join(char if char not in '<>:"/\\|?*' else "_" for char in stem)
    digest = hashlib.sha1(source_path.encode()).hexdigest()[:10]
    return f"{clean_stem}_{digest}{suffix}"


def convert_annotation(xml_bytes: bytes, class_ids: dict[str, int]) -> str:
    root = ET.fromstring(xml_bytes)
    width = float(root.findtext("size/width"))
    height = float(root.findtext("size/height"))
    if width <= 0 or height <= 0:
        return ""
    labels = []
    for object_node in root.findall("object"):
        class_name = object_node.findtext("name", "unknown").strip()
        box = object_node.find("bndbox")
        if box is None or class_name not in class_ids:
            continue
        xmin = float(box.findtext("xmin"))
        ymin = float(box.findtext("ymin"))
        xmax = float(box.findtext("xmax"))
        ymax = float(box.findtext("ymax"))
        center_x = ((xmin + xmax) / 2) / width
        center_y = ((ymin + ymax) / 2) / height
        box_width = (xmax - xmin) / width
        box_height = (ymax - ymin) / height
        labels.append(
            f"{class_ids[class_name]} {center_x:.6f} {center_y:.6f} {box_width:.6f} {box_height:.6f}"
        )
    return "\n".join(labels) + ("\n" if labels else "")


def main() -> None:
    if not (REPO / ".git").is_dir():
        raise FileNotFoundError(f"Clone PlantDoc first into {REPO}")

    tree = git_tree()
    xml_paths = {path for path in tree if path.startswith(("TRAIN/", "TEST/")) and path.lower().endswith(".xml")}
    class_names = set()
    xml_contents = {}
    for xml_path in xml_paths:
        content = read_blob(tree[xml_path])
        xml_contents[xml_path] = content
        root = ET.fromstring(content)
        class_names.update(node.findtext("name", "unknown").strip() for node in root.findall("object"))

    class_ids = {name: index for index, name in enumerate(sorted(class_names))}
    image_paths = [
        path for path in tree
        if path.startswith(("TRAIN/", "TEST/")) and Path(path).suffix.lower() in IMAGE_EXTENSIONS
    ]
    xml_by_stem = {Path(path).with_suffix("").as_posix(): path for path in xml_paths}

    for split, source_prefix in (("train", "TRAIN/"), ("val", "TEST/")):
        image_output = OUTPUT / "images" / split
        label_output = OUTPUT / "labels" / split
        image_output.mkdir(parents=True, exist_ok=True)
        label_output.mkdir(parents=True, exist_ok=True)
        for image_path in (path for path in image_paths if path.startswith(source_prefix)):
            filename = safe_name(image_path)
            (image_output / filename).write_bytes(read_blob(tree[image_path]))
            xml_path = xml_by_stem.get(Path(image_path).with_suffix("").as_posix())
            annotation = convert_annotation(xml_contents[xml_path], class_ids) if xml_path else ""
            (label_output / f"{Path(filename).stem}.txt").write_text(annotation, encoding="utf-8")

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
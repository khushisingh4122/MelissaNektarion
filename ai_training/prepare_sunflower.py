from pathlib import Path
from PIL import Image
import xml.etree.ElementTree as ET
import random

ROOT = Path(__file__).parent
RAW = ROOT / "raw" / "sunflower"
OUT = ROOT / "processed" / "sunflower"

dataset_folders = [p for p in RAW.iterdir() if p.is_dir()]
DATASET = dataset_folders[0]

print("Dataset:", DATASET)

# Maximum crops we actually need
LIMITS = {
    "train": 1500,
    "val": 300,
    "test": 300
}

for split in LIMITS:
    (OUT / split).mkdir(parents=True, exist_ok=True)

image_files = list(DATASET.rglob("*.jpg"))
random.seed(42)
random.shuffle(image_files)

counts = {
    "train": 0,
    "val": 0,
    "test": 0
}

for image_path in image_files:

    parts = [p.lower() for p in image_path.parts]

    if "train" in parts:
        split = "train"
    elif "valid" in parts or "val" in parts:
        split = "val"
    elif "test" in parts:
        split = "test"
    else:
        continue

    if counts[split] >= LIMITS[split]:
        continue

    xml_path = image_path.with_suffix(".xml")

    if not xml_path.exists():
        continue

    try:
        image = Image.open(image_path).convert("RGB")
        root = ET.parse(xml_path).getroot()
    except Exception:
        continue

    width, height = image.size

    for i, obj in enumerate(root.findall(".//object")):

        if counts[split] >= LIMITS[split]:
            break

        box = obj.find("bndbox")

        if box is None:
            continue

        try:
            xmin = int(float(box.find("xmin").text))
            ymin = int(float(box.find("ymin").text))
            xmax = int(float(box.find("xmax").text))
            ymax = int(float(box.find("ymax").text))
        except:
            continue

        if xmax <= xmin or ymax <= ymin:
            continue

        # Add 50% context
        pad_x = int((xmax - xmin) * 0.5)
        pad_y = int((ymax - ymin) * 0.5)

        xmin = max(0, xmin - pad_x)
        ymin = max(0, ymin - pad_y)
        xmax = min(width, xmax + pad_x)
        ymax = min(height, ymax + pad_y)

        crop = image.crop((xmin, ymin, xmax, ymax))

        # Keep files manageable
        crop = crop.resize((224, 224))

        output = OUT / split / f"{image_path.stem}_{i}.jpg"
        crop.save(output, quality=90)

        counts[split] += 1

    if all(counts[s] >= LIMITS[s] for s in LIMITS):
        break

print()
print("SUNFLOWER DATASET READY")
print("Train:", counts["train"])
print("Validation:", counts["val"])
print("Test:", counts["test"])
print("Output:", OUT)

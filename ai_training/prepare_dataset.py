from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
RAW = ROOT / "raw"
OUT = ROOT / "processed"

APPLE_IMG = RAW / "apple" / "Flowering" / "Flowering" / "images"
APPLE_LBL = RAW / "apple" / "Flowering" / "Flowering" / "labels"

# How much surrounding area to include around each tiny flower
PADDING = 5.0

MIN_SIZE = 40


def process_split(split):
    image_dir = APPLE_IMG / split
    label_dir = APPLE_LBL / split

    output_dir = OUT / "apple" / split
    output_dir.mkdir(parents=True, exist_ok=True)

    count = 0

    for image_path in image_dir.iterdir():

        if image_path.suffix.lower() not in [".jpg", ".jpeg", ".png"]:
            continue

        label_path = label_dir / (image_path.stem + ".txt")

        if not label_path.exists():
            continue

        image = Image.open(image_path).convert("RGB")
        width, height = image.size

        lines = label_path.read_text().strip().splitlines()

        for i, line in enumerate(lines):

            parts = line.split()

            if len(parts) != 5:
                continue

            _, xc, yc, bw, bh = map(float, parts)

            # Convert normalized coordinates to pixels
            xc *= width
            yc *= height
            bw *= width
            bh *= height

            # Expand tiny bounding box
            crop_w = max(bw * PADDING, MIN_SIZE)
            crop_h = max(bh * PADDING, MIN_SIZE)

            x1 = max(0, int(xc - crop_w / 2))
            y1 = max(0, int(yc - crop_h / 2))
            x2 = min(width, int(xc + crop_w / 2))
            y2 = min(height, int(yc + crop_h / 2))

            if x2 <= x1 or y2 <= y1:
                continue

            crop = image.crop((x1, y1, x2, y2))

            # Save square-ish crop
            crop = crop.resize((224, 224))

            output_file = output_dir / f"{image_path.stem}_{i}.jpg"
            crop.save(output_file, quality=95)

            count += 1

    print(f"{split}: {count} crops created")


if __name__ == "__main__":
    print("Preparing Apple dataset...")
    process_split("train")
    process_split("val")
    print("DONE!")
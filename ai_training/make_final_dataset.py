from pathlib import Path
import random
import shutil

ROOT = Path(__file__).parent
PROCESSED = ROOT / "processed"
FINAL = ROOT / "final_dataset"

random.seed(42)

# Balanced dataset
COUNTS = {
    "train": 1500,
    "val": 300,
    "test": 300
}

for split in COUNTS:
    for cls in ["apple", "sunflower"]:
        (FINAL / split / cls).mkdir(parents=True, exist_ok=True)


def get_images(folder):
    return list(folder.glob("*.jpg"))


# Apple: sample from existing train/val
apple_train = get_images(PROCESSED / "apple" / "train")
apple_val = get_images(PROCESSED / "apple" / "val")

# Sunflower: use the already-created split
sun_train = get_images(PROCESSED / "sunflower" / "train")
sun_val = get_images(PROCESSED / "sunflower" / "val")
sun_test = get_images(PROCESSED / "sunflower" / "test")


def copy_random(files, destination, count):
    files = files.copy()
    random.shuffle(files)

    selected = files[:count]

    for i, src in enumerate(selected):
        shutil.copy2(src, destination / f"{i:05d}.jpg")


# Apple
copy_random(apple_train, FINAL / "train" / "apple", 1500)
copy_random(apple_val, FINAL / "val" / "apple", 300)

# Create Apple test set from remaining validation crops
remaining_apple = [x for x in apple_val if x.name not in
                   {p.name for p in (FINAL / "val" / "apple").glob("*.jpg")}]

copy_random(remaining_apple, FINAL / "test" / "apple", 300)

# Sunflower
copy_random(sun_train, FINAL / "train" / "sunflower", 1500)
copy_random(sun_val, FINAL / "val" / "sunflower", 300)
copy_random(sun_test, FINAL / "test" / "sunflower", 300)

print("FINAL DATASET CREATED")
print()
print("Train:")
print("Apple:", len(list((FINAL / "train" / "apple").glob("*.jpg"))))
print("Sunflower:", len(list((FINAL / "train" / "sunflower").glob("*.jpg"))))

print()
print("Validation:")
print("Apple:", len(list((FINAL / "val" / "apple").glob("*.jpg"))))
print("Sunflower:", len(list((FINAL / "val" / "sunflower").glob("*.jpg"))))

print()
print("Test:")
print("Apple:", len(list((FINAL / "test" / "apple").glob("*.jpg"))))
print("Sunflower:", len(list((FINAL / "test" / "sunflower").glob("*.jpg"))))
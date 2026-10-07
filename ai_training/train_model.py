from pathlib import Path
import time
import copy

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models

# ============================================================
# PATHS
# ============================================================

ROOT = Path(__file__).parent
DATASET = ROOT / "final_dataset"
MODEL_DIR = ROOT / "models"
MODEL_DIR.mkdir(exist_ok=True)

# ============================================================
# SETTINGS
# ============================================================

BATCH_SIZE = 16
EPOCHS = 10
IMAGE_SIZE = 224
NUM_CLASSES = 2

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Device:", DEVICE)

# ============================================================
# DATA AUGMENTATION
# ============================================================

train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

val_test_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# ============================================================
# DATASETS
# ============================================================

train_dataset = datasets.ImageFolder(
    DATASET / "train",
    transform=train_transform
)

val_dataset = datasets.ImageFolder(
    DATASET / "val",
    transform=val_test_transform
)

test_dataset = datasets.ImageFolder(
    DATASET / "test",
    transform=val_test_transform
)

print("Classes:", train_dataset.classes)

print("Train images:", len(train_dataset))
print("Validation images:", len(val_dataset))
print("Test images:", len(test_dataset))

# ============================================================
# DATALOADERS
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)

# ============================================================
# MODEL
# ============================================================

print("\nLoading MobileNetV3-Small...")

weights = models.MobileNet_V3_Small_Weights.DEFAULT

model = models.mobilenet_v3_small(
    weights=weights
)

# Freeze pretrained layers
for parameter in model.features.parameters():
    parameter.requires_grad = False

# Replace classifier
model.classifier[3] = nn.Linear(
    model.classifier[3].in_features,
    NUM_CLASSES
)

model = model.to(DEVICE)

# ============================================================
# LOSS + OPTIMIZER
# ============================================================

criterion = nn.CrossEntropyLoss()

optimizer = torch.optim.Adam(
    model.classifier.parameters(),
    lr=0.001
)

# ============================================================
# TRAINING
# ============================================================

best_accuracy = 0.0
best_model = copy.deepcopy(model.state_dict())

print("\nStarting training...")
print("=" * 60)

for epoch in range(EPOCHS):

    start_time = time.time()

    # -------------------------
    # TRAIN
    # -------------------------

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in train_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    train_accuracy = 100 * correct / total

    # -------------------------
    # VALIDATION
    # -------------------------

    model.eval()

    val_correct = 0
    val_total = 0
    val_loss = 0.0

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            outputs = model(images)

            loss = criterion(outputs, labels)

            val_loss += loss.item()

            _, predicted = torch.max(outputs, 1)

            val_total += labels.size(0)
            val_correct += (predicted == labels).sum().item()

    val_accuracy = 100 * val_correct / val_total

    elapsed = time.time() - start_time

    print(
        f"Epoch {epoch + 1}/{EPOCHS} | "
        f"Train Loss: {running_loss / len(train_loader):.4f} | "
        f"Train Acc: {train_accuracy:.2f}% | "
        f"Val Loss: {val_loss / len(val_loader):.4f} | "
        f"Val Acc: {val_accuracy:.2f}% | "
        f"Time: {elapsed:.1f}s"
    )

    # Save best model
    if val_accuracy > best_accuracy:

        best_accuracy = val_accuracy

        best_model = copy.deepcopy(model.state_dict())

        torch.save(
            {
                "model_state_dict": best_model,
                "classes": train_dataset.classes,
                "image_size": IMAGE_SIZE
            },
            MODEL_DIR / "mobilenetv3_apple_sunflower.pth"
        )

        print("  -> Best model saved!")

# ============================================================
# LOAD BEST MODEL
# ============================================================

model.load_state_dict(best_model)

# ============================================================
# TEST
# ============================================================

print("\n" + "=" * 60)
print("FINAL TEST")
print("=" * 60)

model.eval()

correct = 0
total = 0

confusion = torch.zeros(
    NUM_CLASSES,
    NUM_CLASSES,
    dtype=torch.int64
)

with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        outputs = model(images)

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)

        correct += (predicted == labels).sum().item()

        for true, pred in zip(labels, predicted):

            confusion[true][pred] += 1

test_accuracy = 100 * correct / total

print(f"\nTest Accuracy: {test_accuracy:.2f}%")

print("\nClass names:")
print(train_dataset.classes)

print("\nConfusion Matrix:")
print(confusion)

# ============================================================
# MODEL SIZE
# ============================================================

model_path = MODEL_DIR / "mobilenetv3_apple_sunflower.pth"

size_mb = model_path.stat().st_size / (1024 * 1024)

print(f"\nModel saved to:")
print(model_path)

print(f"\nModel file size: {size_mb:.2f} MB")

print("\nTRAINING COMPLETE!")
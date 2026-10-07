from pathlib import Path
import torch
import torch.nn as nn
from torchvision import models

ROOT = Path(__file__).parent
MODEL_PATH = ROOT / "models" / "mobilenetv3_apple_sunflower.pth"
OUTPUT_PATH = ROOT / "models" / "mobilenetv3_apple_sunflower.onnx"

# Load MobileNetV3-Small
model = models.mobilenet_v3_small(weights=None)

# Two classes
model.classifier[3] = nn.Linear(
    model.classifier[3].in_features,
    2
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu"
)

model.load_state_dict(checkpoint["model_state_dict"])
model.eval()

# Dummy input
dummy_input = torch.randn(1, 3, 224, 224)

# Export
torch.onnx.export(
    model,
    dummy_input,
    OUTPUT_PATH,
    input_names=["image"],
    output_names=["output"],
    opset_version=12,
    dynamic_axes={
        "image": {0: "batch"},
        "output": {0: "batch"}
    }
)

print("ONNX export complete!")
print("Saved to:")
print(OUTPUT_PATH)
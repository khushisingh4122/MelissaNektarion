from pathlib import Path
import sys

import numpy as np
from PIL import Image
import onnxruntime as ort

MODEL = Path(__file__).parent / "models" / "mobilenetv3_apple_sunflower.onnx"

CLASSES = ["apple", "sunflower"]

session = ort.InferenceSession(
    str(MODEL),
    providers=["CPUExecutionProvider"]
)

if len(sys.argv) < 2:
    print("Usage:")
    print("python ai_training/predict.py path_to_image.jpg")
    sys.exit()

image_path = Path(sys.argv[1])

image = Image.open(image_path).convert("RGB")
image = image.resize((224, 224))

image = np.array(image).astype(np.float32) / 255.0

# ImageNet normalization
mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
std = np.array([0.229, 0.224, 0.225], dtype=np.float32)

image = (image - mean) / std

# HWC → CHW
image = np.transpose(image, (2, 0, 1))

# Add batch dimension
image = np.expand_dims(image, axis=0)

input_name = session.get_inputs()[0].name

output = session.run(
    None,
    {input_name: image}
)[0]

# Softmax
exp = np.exp(output - np.max(output))
probabilities = exp / exp.sum()

prediction = int(np.argmax(probabilities))

print()
print("Prediction:", CLASSES[prediction])
print("Apple probability:", f"{probabilities[0][0] * 100:.2f}%")
print("Sunflower probability:", f"{probabilities[0][1] * 100:.2f}%")
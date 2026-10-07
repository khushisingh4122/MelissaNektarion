from pathlib import Path
import onnxruntime as ort

MODEL = Path(__file__).parent / "models" / "mobilenetv3_apple_sunflower.onnx"

session = ort.InferenceSession(
    str(MODEL),
    providers=["CPUExecutionProvider"]
)

print("ONNX model loaded successfully!")

print("Input:")
for x in session.get_inputs():
    print("Name:", x.name)
    print("Shape:", x.shape)

print("\nOutput:")
for x in session.get_outputs():
    print("Name:", x.name)
    print("Shape:", x.shape)

print("\nProviders:")
print(session.get_providers())
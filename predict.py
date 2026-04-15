"""
CyberX - Deepfake Detection
============================
Uses trained cyberx_model.pth (EfficientNet-B4)
Smart threshold + ensemble scoring for better fake detection
"""

import os
import cv2
import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
from facenet_pytorch import MTCNN
from typing import Dict, Any

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
FRAMES_TO_SAMPLE = 20          # more frames = better accuracy
IMG_SIZE         = 224
DEVICE           = torch.device("cpu")
MODEL_PATH       = "cyberx_model.pth"

# ── Threshold tuning ──
# Lower = more sensitive to fakes (catches more fakes, may flag some real)
# Higher = less sensitive (misses some fakes, fewer false alarms)
FAKE_THRESHOLD   = 0.45        # was 0.5 — lowered to catch more fakes

# ─────────────────────────────────────────────
# Transform
# ─────────────────────────────────────────────
_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])

# ─────────────────────────────────────────────
# Load Model
# ─────────────────────────────────────────────
def build_model():
    model = models.efficientnet_b4(weights=models.EfficientNet_B4_Weights.DEFAULT)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, 2)
    return model

print("[CyberX] Loading model...")
_model = build_model()

if os.path.exists(MODEL_PATH):
    _model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    print(f"[CyberX] ✓ Trained model loaded → {MODEL_PATH}")
else:
    print("[CyberX] ⚠ cyberx_model.pth not found — using pretrained weights")

_model.to(DEVICE)
_model.eval()
print("[CyberX] Model ready!")

# ─────────────────────────────────────────────
# Face Detector
# ─────────────────────────────────────────────
_mtcnn = MTCNN(
    image_size=IMG_SIZE,
    margin=20,
    min_face_size=40,
    device=DEVICE,
    keep_all=False,
    post_process=False
)

# ─────────────────────────────────────────────
# Frame Extraction
# ─────────────────────────────────────────────
def extract_frames(video_path: str, num_frames: int = FRAMES_TO_SAMPLE):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {video_path}")

    total    = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps      = cap.get(cv2.CAP_PROP_FPS) or 30
    duration = round(total / fps, 2)

    if total == 0:
        cap.release()
        raise ValueError("Video has 0 frames.")

    interval = max(1, total // num_frames)
    frames   = []

    for i in range(0, total, interval):
        if len(frames) >= num_frames:
            break
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if ret:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(Image.fromarray(rgb))

    cap.release()
    return frames, {
        "total_frames": total,
        "fps":          round(fps, 1),
        "duration_sec": duration
    }

# ─────────────────────────────────────────────
# Smart scoring — uses both mean AND peak fake prob
# ─────────────────────────────────────────────
def compute_fake_score(frame_probs: list) -> float:
    """
    Combine average + top-3 peak frames.
    Real deepfakes often have only a few very suspicious frames.
    """
    avg  = np.mean(frame_probs)

    # Top 3 most suspicious frames ka average
    top3 = np.mean(sorted(frame_probs, reverse=True)[:3])

    # Weighted combination: 40% average + 60% peak
    score = 0.4 * avg + 0.6 * top3
    return float(score)

# ─────────────────────────────────────────────
# Prediction
# ─────────────────────────────────────────────
def predict_video(video_path: str) -> Dict[str, Any]:
    frames, video_info = extract_frames(video_path)
    if not frames:
        return {"error": "Could not extract frames."}

    frame_fake_probs = []
    faces_found      = 0

    with torch.no_grad():
        for frame in frames:
            # Try face crop first
            face = _mtcnn(frame)
            if face is not None:
                faces_found += 1
                face_img = Image.fromarray(
                    face.permute(1, 2, 0).byte().numpy()
                )
                tensor = _transform(face_img).unsqueeze(0).to(DEVICE)
            else:
                # No face — use full frame
                tensor = _transform(frame).unsqueeze(0).to(DEVICE)

            output = _model(tensor)
            probs  = torch.softmax(output, dim=1)[0]
            frame_fake_probs.append(probs[1].item())  # index 1 = Fake

    # Smart score combining avg + peak
    avg_fake  = compute_fake_score(frame_fake_probs)
    avg_real  = 1.0 - avg_fake

    label = "FAKE" if avg_fake >= FAKE_THRESHOLD else "REAL"
    conf  = avg_fake if label == "FAKE" else avg_real

    if avg_fake >= 0.65:
        risk = "HIGH"
    elif avg_fake >= 0.35:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    indexed    = sorted(enumerate(frame_fake_probs), key=lambda x: x[1], reverse=True)
    suspicious = [i for i, p in indexed[:5] if p >= FAKE_THRESHOLD]

    return {
        "label":             label,
        "confidence":        round(conf * 100, 2),
        "risk_level":        risk,
        "fake_probability":  round(avg_fake, 4),
        "real_probability":  round(avg_real, 4),
        "frames_analyzed":   len(frames),
        "faces_detected":    faces_found,
        "suspicious_frames": suspicious,
        "video_info":        video_info,
    }

# ─────────────────────────────────────────────
# Standalone test
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import argparse, json
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", required=True)
    args   = parser.parse_args()
    result = predict_video(args.video)
    print(json.dumps(result, indent=2))
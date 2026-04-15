"""
CyberX - Deepfake Detection Model Training (Fully Balanced)
============================================================
Dataset: FaceForensics++ ONLY — perfect 50/50 balance
Run: python train_model.py
"""

import os
import cv2
import random
import shutil
import numpy as np
from PIL import Image
from tqdm import tqdm

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from torchvision import models, transforms
from sklearn.metrics import accuracy_score, classification_report

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
FF_REAL_DIR      = r"C:\Users\hp\Downloads\archive (1)\FF++\real"
FF_FAKE_DIR      = r"C:\Users\hp\Downloads\archive (1)\FF++\fake"
FRAMES_OUTPUT    = "dataset_frames"
MODEL_SAVE       = "cyberx_model.pth"
FRAMES_PER_VIDEO = 15
BATCH_SIZE       = 16
EPOCHS           = 15
LEARNING_RATE    = 1e-4
IMG_SIZE         = 224
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"[CyberX] Using device: {DEVICE}")


# ─────────────────────────────────────────────
# STEP 0 — Clear old frames
# ─────────────────────────────────────────────
def clear_old_frames():
    if os.path.exists(FRAMES_OUTPUT):
        print(f"  Clearing old frames...")
        shutil.rmtree(FRAMES_OUTPUT)
    print("  Done — starting fresh.")


# ─────────────────────────────────────────────
# STEP 1 — Extract frames
# ─────────────────────────────────────────────
def extract_frames(video_path, output_dir, num_frames=FRAMES_PER_VIDEO):
    os.makedirs(output_dir, exist_ok=True)
    cap   = cv2.VideoCapture(video_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total == 0:
        cap.release()
        return 0
    interval = max(1, total // num_frames)
    saved = 0
    for i in range(0, total, interval):
        if saved >= num_frames:
            break
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if ret:
            cv2.imwrite(os.path.join(output_dir, f"frame_{saved:04d}.jpg"), frame)
            saved += 1
    cap.release()
    return saved


def prepare_ff_frames():
    for label, src_dir in [("real", FF_REAL_DIR), ("fake", FF_FAKE_DIR)]:
        if not os.path.exists(src_dir):
            print(f"  [ERROR] {src_dir} not found!")
            continue
        videos = [f for f in os.listdir(src_dir) if f.endswith((".mp4", ".avi", ".mov"))]
        print(f"  {label}: {len(videos)} videos × {FRAMES_PER_VIDEO} frames = {len(videos)*FRAMES_PER_VIDEO} frames")
        for vid in tqdm(videos, desc=f"FF++ {label}"):
            out_dir = os.path.join(FRAMES_OUTPUT, label, f"ff_{os.path.splitext(vid)[0]}")
            if not os.path.exists(out_dir):
                extract_frames(os.path.join(src_dir, vid), out_dir)


# ─────────────────────────────────────────────
# STEP 2 — Dataset
# ─────────────────────────────────────────────
class DeepfakeDataset(Dataset):
    def __init__(self, root_dir, split="train", transform=None):
        self.transform = transform
        self.samples   = []
        for label, cls in enumerate(["real", "fake"]):
            cls_path = os.path.join(root_dir, cls)
            if not os.path.exists(cls_path):
                continue
            for folder in os.listdir(cls_path):
                fp = os.path.join(cls_path, folder)
                if os.path.isdir(fp):
                    for fname in os.listdir(fp):
                        if fname.endswith(".jpg"):
                            self.samples.append((os.path.join(fp, fname), label))

        random.seed(42)
        random.shuffle(self.samples)
        n = len(self.samples)
        if split == "train":
            self.samples = self.samples[:int(0.8*n)]
        elif split == "val":
            self.samples = self.samples[int(0.8*n):int(0.9*n)]
        else:
            self.samples = self.samples[int(0.9*n):]

        real_c = sum(1 for _, l in self.samples if l == 0)
        fake_c = sum(1 for _, l in self.samples if l == 1)
        print(f"  {split:5s} → {len(self.samples):,} samples (real={real_c}, fake={fake_c})")

    def __len__(self): return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, label


# ─────────────────────────────────────────────
# STEP 3 — Model
# ─────────────────────────────────────────────
def build_model():
    model = models.efficientnet_b4(weights=models.EfficientNet_B4_Weights.DEFAULT)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, 2)
    return model.to(DEVICE)


# ─────────────────────────────────────────────
# STEP 4 — Train
# ─────────────────────────────────────────────
def train():
    train_tf = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2, hue=0.1),
        transforms.RandomGrayscale(p=0.05),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    val_tf = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])

    print("\n[2] Building datasets...")
    train_ds = DeepfakeDataset(FRAMES_OUTPUT, "train", train_tf)
    val_ds   = DeepfakeDataset(FRAMES_OUTPUT, "val",   val_tf)

    # Balanced sampler
    labels_list  = [s[1] for s in train_ds.samples]
    class_counts = [labels_list.count(0), labels_list.count(1)]
    weights  = [1.0 / class_counts[l] for l in labels_list]
    sampler  = WeightedRandomSampler(weights, len(weights), replacement=True)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, sampler=sampler, num_workers=0)
    val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False,   num_workers=0)

    print("\n[3] Building model...")
    model     = build_model()
    criterion = nn.CrossEntropyLoss()  # equal weight — no bias
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-5)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

    best_score = 0.0  # balanced score = 0.5*val_acc + 0.5*fake_recall

    print(f"\n[4] Training {EPOCHS} epochs on {DEVICE}...\n")

    for epoch in range(1, EPOCHS + 1):
        # Train
        model.train()
        train_loss, all_preds, all_labels = 0.0, [], []
        for imgs, labels in tqdm(train_loader, desc=f"Epoch {epoch}/{EPOCHS} [train]"):
            imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
            optimizer.zero_grad()
            out  = model(imgs)
            loss = criterion(out, labels)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
            all_preds.extend(out.argmax(1).cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
        train_acc = accuracy_score(all_labels, all_preds)

        # Validate
        model.eval()
        v_preds, v_labels = [], []
        with torch.no_grad():
            for imgs, labels in tqdm(val_loader, desc=f"Epoch {epoch}/{EPOCHS} [val]  "):
                imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
                out = model(imgs)
                v_preds.extend(out.argmax(1).cpu().numpy())
                v_labels.extend(labels.cpu().numpy())

        val_acc = accuracy_score(v_labels, v_preds)
        scheduler.step()

        # Fake recall
        fake_correct = sum(1 for p, l in zip(v_preds, v_labels) if p == 1 and l == 1)
        fake_total   = sum(1 for l in v_labels if l == 1)
        fake_recall  = fake_correct / fake_total if fake_total > 0 else 0

        # Real recall (so model doesn't flag everything as fake)
        real_correct = sum(1 for p, l in zip(v_preds, v_labels) if p == 0 and l == 0)
        real_total   = sum(1 for l in v_labels if l == 0)
        real_recall  = real_correct / real_total if real_total > 0 else 0

        # Balanced score — both must be good
        balanced_score = 0.5 * fake_recall + 0.5 * real_recall

        print(f"\nEpoch {epoch:02d} | Loss: {train_loss/len(train_loader):.4f} | "
              f"Train: {train_acc:.4f} | Val: {val_acc:.4f} | "
              f"Fake Recall: {fake_recall:.4f} | Real Recall: {real_recall:.4f} | "
              f"Score: {balanced_score:.4f}")

        if balanced_score > best_score:
            best_score = balanced_score
            torch.save(model.state_dict(), MODEL_SAVE)
            print(f"  ✓ Best model saved! (fake_recall={fake_recall:.4f}, real_recall={real_recall:.4f})")

    print(f"\n✅ Training complete! Best balanced score: {best_score:.4f}")
    print(f"   Model saved: {MODEL_SAVE}")

    # Test
    print("\n[5] Final test evaluation...")
    test_ds     = DeepfakeDataset(FRAMES_OUTPUT, "test", val_tf)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    model.load_state_dict(torch.load(MODEL_SAVE, map_location=DEVICE))
    model.eval()
    t_preds, t_labels = [], []
    with torch.no_grad():
        for imgs, labels in tqdm(test_loader, desc="Test"):
            out = model(imgs.to(DEVICE))
            t_preds.extend(out.argmax(1).cpu().numpy())
            t_labels.extend(labels.numpy())
    print("\n" + classification_report(t_labels, t_preds, target_names=["Real", "Fake"]))


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 55)
    print("  CyberX — Balanced Deepfake Detection Training")
    print("=" * 55)

    clear_old_frames()

    print("\n[1] Extracting FF++ frames...")
    prepare_ff_frames()

    def count_frames(cls):
        p = os.path.join(FRAMES_OUTPUT, cls)
        if not os.path.exists(p): return 0
        return sum(
            len([f for f in os.listdir(os.path.join(p, d)) if f.endswith(".jpg")])
            for d in os.listdir(p) if os.path.isdir(os.path.join(p, d))
        )

    real_c = count_frames("real")
    fake_c = count_frames("fake")
    print(f"\n  Real  : {real_c:,} frames")
    print(f"  Fake  : {fake_c:,} frames")
    print(f"  Total : {real_c+fake_c:,} frames")
    print(f"  Ratio : {round(fake_c/max(real_c,1)*100)}% fake (ideal=50%)")

    if real_c + fake_c == 0:
        print("\n  [ERROR] No frames found. Check CONFIG paths.")
    else:
        train()
"""
CyberX - Flask Backend API
===========================
Uses predict2.py (HuggingFace deepfake model)
Run: python app.py
"""

import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Using predict2 - HuggingFace deepfake model
from predict import predict_video

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
ALLOWED       = {"mp4", "avi", "mov", "mkv", "webm"}
app.config["MAX_CONTENT_LENGTH"] = 200 * 1024 * 1024  # 200MB
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "CyberX API v2"})


@app.route("/api/analyze", methods=["POST"])
def analyze():
    if "video" not in request.files:
        return jsonify({"error": "No video file. Use field name 'video'."}), 400

    file = request.files["video"]

    if file.filename == "" or not allowed(file.filename):
        return jsonify({"error": "Invalid or unsupported file."}), 400

    ext       = file.filename.rsplit(".", 1)[1].lower()
    save_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4().hex}.{ext}")
    file.save(save_path)

    try:
        result = predict_video(save_path)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(save_path):
            os.remove(save_path)

    return jsonify({
        "success":  True,
        "filename": secure_filename(file.filename),
        "result":   result
    })


@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Max 200MB."}), 413


if __name__ == "__main__":
    print("=" * 45)
    print("  CyberX API v2 → http://localhost:5000")
    print("  Model: HuggingFace Deepfake Detection")
    print("=" * 45)
    app.run(debug=True, host="0.0.0.0", port=5000)
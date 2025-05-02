
from flask import Blueprint, request, jsonify
from ultralytics import YOLO
from PIL import Image
import io

detect_bp = Blueprint('detect', __name__)
model = YOLO('yolov8n.pt')  # Replace with actual path if needed

@detect_bp.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image_file = request.files['image']
    image = Image.open(image_file.stream)
    results = model.predict(image)

    detections = []
    for r in results:
        for box in r.boxes:
            label = r.names[int(box.cls)]
            bbox = box.xyxy[0].tolist()
            confidence = float(box.conf)
            detections.append({
                "label": label,
                "confidence": confidence,
                "bbox": bbox
            })

    return jsonify(detections)

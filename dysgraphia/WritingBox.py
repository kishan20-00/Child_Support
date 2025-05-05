import cv2
import numpy as np
from flask import Flask, request, jsonify
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/predict', methods=['POST'])
def predict_dysgraphia():
    if 'file' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['file']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # Process the image
    percentage, review = analyze_blocks(filepath)
    
    return jsonify({
        'prediction': review,
        'percentage': f"{percentage:.2f}%"  # Format percentage to 2 decimal places
    })

def analyze_blocks(image_path):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply edge detection to detect boxes
    edged = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    boxes = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w > 30 and h > 30:  # Ignore small contours
            boxes.append((x, y, w, h))

    # Sort boxes by position
    boxes = sorted(boxes, key=lambda b: (b[1], b[0]))

    text_ratios = []

    # Check if text is inside the box
    for (x, y, w, h) in boxes:
        roi = gray[y:y+h, x:x+w]
        _, thresholded = cv2.threshold(roi, 128, 255, cv2.THRESH_BINARY_INV)

        text_pixels = np.count_nonzero(thresholded)
        total_pixels = w * h
        text_ratio = text_pixels / total_pixels

        text_ratios.append(text_ratio)

    # Calculate average text ratio
    if text_ratios:
        avg_text_ratio = sum(text_ratios) / len(text_ratios)
    else:
        avg_text_ratio = 0  # No detected boxes

    # Define threshold for dysgraphia potential
    threshold = 0.5  # Adjust as needed
    review = "High Potential Dysgraphia" if avg_text_ratio > threshold else "Low Potential Dysgraphia"

    return avg_text_ratio * 100, review  # Return percentage and review

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5006)

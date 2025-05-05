import cv2
import numpy as np
from flask import Flask, request, jsonify
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['file']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # Analyze if letters are inside the two lines
    result = analyze_letter_position(filepath)

    return jsonify({'prediction': result})

def analyze_letter_position(image_path):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply edge detection to find lines
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, minLineLength=100, maxLineGap=10)

    if lines is None or len(lines) < 2:
        return "Error: Could not detect two horizontal lines."

    # Sort lines by y-coordinates to get top and bottom lines
    lines = sorted(lines, key=lambda line: line[0][1])
    top_line_y = lines[0][0][1]
    bottom_line_y = lines[-1][0][1]

    # Extract region between two lines
    region = gray[top_line_y:bottom_line_y, :]

    # Count dark pixels in the region (assuming letters are darker than background)
    text_pixels = np.count_nonzero(region < 128)
    total_pixels = region.shape[0] * region.shape[1]
    text_ratio = text_pixels / total_pixels

    # If letters exceed the lines, return high potential
    if text_ratio > 0.3:  # Adjust threshold as needed
        return "High Potential of Dysgraphia"
    else:
        return "Low Potential of Dysgraphia"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5007)

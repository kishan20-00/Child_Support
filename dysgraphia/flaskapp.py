import os
import numpy as np
import cv2
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from collections import Counter
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Load the trained model
model = load_model("handwriting_dysgraphia_model.h5")

# Define class labels
class_labels = ['Low Potential Dysgraphia', 'Potential Dysgraphia']

def segment_words(image_path):
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    h, w, c = img.shape
    if w > 1000:
        new_w = 1000
        ar = w / h
        new_h = int(new_w / ar)
        img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)

    img_gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(img_gray, 80, 255, cv2.THRESH_BINARY_INV)

    kernel_line = np.ones((3, 85), np.uint8)
    dilated_line = cv2.dilate(thresh, kernel_line, iterations=1)
    contours_line, _ = cv2.findContours(dilated_line, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    sorted_lines = sorted(contours_line, key=lambda ctr: cv2.boundingRect(ctr)[1])

    kernel_word = np.ones((3, 15), np.uint8)
    dilated_word = cv2.dilate(thresh, kernel_word, iterations=1)

    processed_words = []

    for line in sorted_lines:
        x, y, w, h = cv2.boundingRect(line)
        roi_line = dilated_word[y:y + h, x:x + w]

        contours_word, _ = cv2.findContours(roi_line, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        sorted_words = sorted(contours_word, key=lambda c: cv2.boundingRect(c)[0])

        for word in sorted_words:
            if cv2.contourArea(word) < 400:
                continue

            x2, y2, w2, h2 = cv2.boundingRect(word)
            word_img = img[y + y2:y + y2 + h2, x + x2:x + x2 + w2]

            # Convert to grayscale and invert colors (text -> white, background -> black)
            word_gray = cv2.cvtColor(word_img, cv2.COLOR_RGB2GRAY)
            _, word_binary = cv2.threshold(word_gray, 80, 255, cv2.THRESH_BINARY_INV)

            # Resize and normalize
            word_resized = cv2.resize(word_binary, (150, 150))
            word_normalized = word_resized / 255.0
            word_normalized = np.expand_dims(word_normalized, axis=-1)

            processed_words.append(word_normalized)

    return np.array(processed_words)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    filename = secure_filename(file.filename)
    image_path = os.path.join("uploads", filename)
    os.makedirs("uploads", exist_ok=True)
    file.save(image_path)

    # Segment words and process in-memory
    processed_words = segment_words(image_path)

    if len(processed_words) == 0:
        return jsonify({'error': 'No valid words detected'}), 400

    # Predict on segmented words
    predictions = model.predict(processed_words)
    predicted_classes = [int(np.round(prediction[0])) for prediction in predictions]
    majority_prediction = Counter(predicted_classes).most_common(1)[0][0]
    predicted_class_label = class_labels[majority_prediction]

    return jsonify({'prediction': predicted_class_label})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5004)

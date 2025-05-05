import os
import numpy as np
import cv2
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from collections import Counter
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Load the trained model
model = load_model("letter_by_letter_check_model.h5")

# Define class labels
class_labels = ["Low", "Intermediary", "Good"]

# Define reviews for each class
class_reviews = {
    "Good": "Excellent performance! Your handwriting is very clear and well-structured. Keep up the great work!",
    "Intermediary": "Good performance! Your handwriting is clear, but there is some room for improvement. Practice regularly to enhance your skills.",
    "Low": "Fair performance. Your handwriting shows potential, but it needs improvement. Focus on consistency and clarity."
}

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
            processed_words.append(word_img)

    return processed_words

def segment_characters(word_img):
    word_gray = cv2.cvtColor(word_img, cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(word_gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    char_bboxes = sorted([cv2.boundingRect(c) for c in contours], key=lambda x: x[0])

    processed_chars = []
    for x, y, w, h in char_bboxes:
        if w > 5 and h > 10:  # Filter out small noise
            char_img = thresh[y:y + h, x:x + w]
            char_img = cv2.resize(char_img, (150, 150))  # Resize to 150x150
            char_img = 255 - char_img  # Invert colors
            char_img = np.expand_dims(char_img, axis=-1) / 255.0  # Normalize and add channel dimension
            processed_chars.append(char_img)

    return np.array(processed_chars)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    filename = secure_filename(file.filename)
    image_path = os.path.join("uploads", filename)
    os.makedirs("uploads", exist_ok=True)
    file.save(image_path)

    # Segment words
    words = segment_words(image_path)
    if len(words) == 0:
        return jsonify({'error': 'No valid words detected'}), 400

    all_predictions = []
    
    for word_img in words:
        characters = segment_characters(word_img)
        if len(characters) > 0:
            predictions = model.predict(characters)
            predicted_classes = [int(np.round(prediction[0])) for prediction in predictions]
            majority_prediction = Counter(predicted_classes).most_common(1)[0][0]
            all_predictions.append(majority_prediction)
    
    if not all_predictions:
        return jsonify({'error': 'No valid characters detected'}), 400
    
    final_prediction = class_labels[Counter(all_predictions).most_common(1)[0][0]]
    review = class_reviews[final_prediction]  # Get the review for the predicted class
    return jsonify({'prediction': final_prediction, 'review': review})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5010)
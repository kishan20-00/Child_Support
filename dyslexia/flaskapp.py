import os
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
from flask import Flask, request, jsonify
from PIL import Image

app = Flask(__name__)

# Load the trained model
MODEL_PATH = 'dyslexia_model.h5'
model = load_model(MODEL_PATH)

# Class names
CLASS_NAMES = ['Corrected', 'Normal', 'Reversal']

# Function to preprocess the image
def preprocess_image(img):
    img = img.resize((128, 128))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    return img_array

# Segment words from the image
def segment_words(image_path):
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(img_gray, 80, 255, cv2.THRESH_BINARY_INV)
    kernel_word = np.ones((3, 15), np.uint8)
    dilated_word = cv2.dilate(thresh, kernel_word, iterations=1)
    contours_word, _ = cv2.findContours(dilated_word, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    sorted_words = sorted(contours_word, key=lambda c: cv2.boundingRect(c)[0])
    word_images = []
    for word in sorted_words:
        x, y, w, h = cv2.boundingRect(word)
        word_img = img[y:y+h, x:x+w]
        word_images.append(word_img)
    return word_images

# Segment characters from words
def segment_characters(word_img):
    img_gray = cv2.cvtColor(word_img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(img_gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    char_bboxes = sorted([cv2.boundingRect(c) for c in contours], key=lambda x: x[0])
    char_images = [word_img[y:y+h, x:x+w] for (x, y, w, h) in char_bboxes if w > 5 and h > 10]
    return char_images

# Predict dyslexia category
def predict_dyslexia(img):
    preprocessed_image = preprocess_image(img)
    predictions = model.predict(preprocessed_image)
    return CLASS_NAMES[np.argmax(predictions)]

# Generate review based on percentages
def generate_review(class_percentages):
    reversal_percentage = class_percentages.get('Reversal', 0)
    
    if reversal_percentage < 20:
        review = "Low potential of dyslexia. The text shows minimal signs of reversal errors."
    elif 20 <= reversal_percentage < 50:
        review = "Moderate potential of dyslexia. The text shows some signs of reversal errors, which may indicate a moderate potential of dyslexia."
    else:
        review = "High potential of dyslexia. The text shows significant signs of reversal errors, indicating a high potential of dyslexia."
    
    return review

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    img = Image.open(file)
    
    # Save the uploaded image temporarily
    temp_path = "temp_image.png"
    img.save(temp_path)
    
    # Segment words and characters
    word_images = segment_words(temp_path)
    all_predictions = []
    for word_img in word_images:
        char_images = segment_characters(word_img)
        predictions = [predict_dyslexia(Image.fromarray(cv2.cvtColor(c, cv2.COLOR_BGR2RGB))) for c in char_images]
        all_predictions.extend(predictions)
    
    # Compute class participation percentages
    total_predictions = len(all_predictions)
    class_counts = {class_name: all_predictions.count(class_name) for class_name in CLASS_NAMES}
    class_percentages = {class_name: (count / total_predictions) * 100 for class_name, count in class_counts.items()}
    
    # Generate review
    review = generate_review(class_percentages)
    
    # Add review to the response
    response = {
        'class_percentages': class_percentages,
        'review': review
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)
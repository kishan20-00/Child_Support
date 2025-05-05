from flask import Flask, request, jsonify
import numpy as np
import cv2
from PIL import Image
import tensorflow as tf
import io

# Initialize Flask app
app = Flask(__name__)

# Load the trained model
model = tf.keras.models.load_model('dyslexia_handwriting_model.h5')

# Define image dimensions for the model
img_width, img_height = 128, 128

# Class labels
class_labels = ['Corrected', 'Reversal', 'Normal']

# Function to preprocess the image for the model
def preprocess_image(image):
    # Resize and normalize the image
    image = image.resize((img_width, img_height))
    image = np.array(image) / 255.0
    if len(image.shape) == 2:  # If grayscale, convert to RGB
        image = np.stack((image,) * 3, axis=-1)
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

# Function to segment words from an image
def segment_words(image):
    """Segments words from a handwritten text image."""
    img = np.array(image)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)  # Convert PIL image to OpenCV format

    # Resize image if it's too large
    h, w, _ = img.shape
    if w > 1000:
        new_w = 1000
        ar = w / h
        new_h = int(new_w / ar)
        img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # Convert to grayscale and apply threshold
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(img_gray, 80, 255, cv2.THRESH_BINARY_INV)

    # Detect lines
    kernel_line = np.ones((3, 85), np.uint8)
    dilated_line = cv2.dilate(thresh, kernel_line, iterations=1)
    contours_line, _ = cv2.findContours(dilated_line, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    sorted_lines = sorted(contours_line, key=lambda ctr: cv2.boundingRect(ctr)[1])

    # Detect words
    kernel_word = np.ones((3, 15), np.uint8)
    dilated_word = cv2.dilate(thresh, kernel_word, iterations=1)

    word_images = []
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
            word_images.append(word_img)

    return word_images

# Function to segment characters from a word image
def segment_characters(word_image):
    """Segments characters from a word image."""
    img_gray = cv2.cvtColor(word_image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(img_gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    char_bboxes = sorted([cv2.boundingRect(c) for c in contours], key=lambda x: x[0])

    char_images = []
    for x, y, w, h in char_bboxes:
        if w > 5 and h > 10:  # Filter out small noise
            char_img = thresh[y:y + h, x:x + w]
            char_img = cv2.resize(char_img, (64, 64))

            # Ensure text is black and background is white
            char_img = 255 - char_img  # Invert colors

            # Create a larger white background canvas
            padded_img = np.ones((200, 200), dtype=np.uint8) * 255  # White background
            x_offset = (200 - 64) // 2
            y_offset = (200 - 64) // 2
            padded_img[y_offset:y_offset + 64, x_offset:x_offset + 64] = char_img

            char_images.append(padded_img)

    return char_images

# API endpoint for prediction
@app.route('/predict', methods=['POST'])
def predict():
    # Check if an image file is provided in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']

    try:
        # Open the image file
        image = Image.open(file).convert('RGB')  # Ensure RGB format

        # Segment words from the image
        word_images = segment_words(image)

        # Initialize counters for each class
        class_counts = {'Corrected': 0, 'Reversal': 0, 'Normal': 0}

        for word_img in word_images:
            # Segment characters from each word
            char_images = segment_characters(word_img)

            for char_img in char_images:
                # Convert OpenCV image to PIL image
                char_img_pil = Image.fromarray(char_img)

                # Preprocess the character image for the model
                processed_image = preprocess_image(char_img_pil)

                # Make prediction
                prediction = model.predict(processed_image)
                predicted_class = np.argmax(prediction, axis=1)[0]
                predicted_label = class_labels[predicted_class]

                # Increment the count for the predicted class
                class_counts[predicted_label] += 1

        # Calculate percentages
        total_predictions = sum(class_counts.values())
        if total_predictions > 0:
            percentages = {
                'Corrected': (class_counts['Corrected'] / total_predictions) * 100,
                'Reversal': (class_counts['Reversal'] / total_predictions) * 100,
                'Normal': (class_counts['Normal'] / total_predictions) * 100
            }
        else:
            percentages = {'Corrected': 0, 'Reversal': 0, 'Normal': 0}

        # Return the result
        return jsonify({'percentages': percentages})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005)
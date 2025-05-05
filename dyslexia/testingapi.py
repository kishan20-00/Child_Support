from flask import Flask, request, jsonify
import numpy as np
from PIL import Image
import tensorflow as tf

# Initialize Flask app
app = Flask(__name__)

# Load the trained model
model = tf.keras.models.load_model('dyslexia_handwriting_model.h5')

# Define image dimensions
img_width, img_height = 128, 128

# Class labels
class_labels = ['Corrected', 'Reversal', 'Normal']

# Function to preprocess the image
def preprocess_image(image):
    # Resize and normalize the image
    image = image.resize((img_width, img_height))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

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
        # Preprocess the image
        processed_image = preprocess_image(image)
        # Make prediction
        predictions = model.predict(processed_image)
        predicted_class = np.argmax(predictions, axis=1)[0]
        predicted_label = class_labels[predicted_class]
        confidence = float(predictions[0][predicted_class])
        # Return the result
        return jsonify({
            'predicted_class': predicted_label,
            'confidence': confidence
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
from flask import Flask, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import cv2
import io

app = Flask(__name__)

# Load the pre-trained Keras model
best_model = load_model('detection.h5')

def preprocess_image(image):
    resized_img = image.resize((64, 64))
    rgb_img = resized_img.convert('RGB')
    np_img = np.array(rgb_img)
    normalized_img = np_img / 255.0
    return normalized_img

def predict_image(image):
    preprocessed_img = preprocess_image(image)
    preprocessed_img = np.expand_dims(preprocessed_img, axis=0)
    preprocessed_img = preprocessed_img.reshape(1, 64, 64, 3)
    result = best_model.predict(preprocessed_img)
    return result[0][0]  # Assuming single output node

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    image = Image.open(io.BytesIO(file.read()))
    prediction = predict_image(image)
    result = "Focus" if prediction > 0.5 else "Not Focus"
    
    return jsonify({'prediction': result})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
import streamlit as st
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np
from PIL import Image

# Load the trained model
MODEL_PATH = 'dyslexia_model.h5'  # Replace with the path to your saved model
model = load_model(MODEL_PATH)

# Class names (ensure the order matches the labels in your training data)
class_names = ['Corrected', 'Normal', 'Reversal']

# Function to preprocess the uploaded image
def preprocess_image(image):
    img = image.resize((128, 128))  # Resize to match model's input size
    img_array = img_to_array(img) / 255.0  # Normalize pixel values
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array

# Streamlit UI
st.title("Dyslexia Variety Predictor")
st.write("Upload an image of handwritten text to predict its dyslexia variety.")

# Upload image
uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "png", "jpeg"])

if uploaded_file is not None:
    # Display uploaded image
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_column_width=True)

    # Preprocess and predict
    st.write("Classifying...")
    img_array = preprocess_image(image)
    predictions = model.predict(img_array)
    predicted_class = class_names[np.argmax(predictions)]
    confidence = np.max(predictions)

    # Display results
    st.write(f"**Prediction:** {predicted_class}")
    st.write(f"**Confidence:** {confidence * 100:.2f}%")

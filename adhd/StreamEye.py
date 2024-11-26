import streamlit as st
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image

# Load the pre-trained Keras model
best_model = load_model('detection.h5')

# Function to preprocess the input image
def preprocess_image(image):
    # Resize the image to match the size used during training (64x64)
    resized_img = image.resize((64, 64))
    # Convert image to RGB if it is not already
    rgb_img = resized_img.convert('RGB')
    # Convert image to numpy array
    np_img = np.array(rgb_img)
    # Normalize pixel values to the range [0, 1]
    normalized_img = np_img / 255.0
    return normalized_img

# Function to predict using the loaded model
def predict_image(image):
    preprocessed_img = preprocess_image(image)
    # Add batch dimension
    preprocessed_img = np.expand_dims(preprocessed_img, axis=0)
    # Reshape to match model input shape (1, 64, 64, 3)
    preprocessed_img = preprocessed_img.reshape(1, 64, 64, 3)
    # Predict using the model
    result = best_model.predict(preprocessed_img)
    return result

# Streamlit app layout
st.title("Face Tracking Model")
st.write("Upload an image to check if it is focused or not.")

# Image upload feature
uploaded_image = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_image is not None:
    # Open the uploaded image
    image = Image.open(uploaded_image)
    st.image(image, caption='Uploaded Image', use_container_width=True)
    st.write("")
    
    # Predict the focus status
    prediction = predict_image(image)
    
    if prediction > 0.5:
        st.success('Prediction: Focus')
    else:
        st.error('Prediction: Not Focus')

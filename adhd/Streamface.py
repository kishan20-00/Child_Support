import streamlit as st
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image

# Load the trained model
model = load_model('face_direction_model_final.h5')  # Make sure to update the path to your model file

# Face directions mapping
directions = ['bottom', 'left', 'right', 'top']

# Function to preprocess the input image
def preprocess_image(image):
    # Resize the image to the input size expected by the model
    img = image.resize((64, 64))
    img = np.array(img)  # Convert the image to numpy array
    img = img / 255.0  # Normalize pixel values
    return np.expand_dims(img, axis=0)  # Add batch dimension

# Function to predict face direction from the input image
def predict_face_direction(image):
    preprocessed_img = preprocess_image(image)
    prediction = model.predict(preprocessed_img)  # Get the prediction
    return prediction

# Streamlit App UI
st.title("Face Direction Prediction")
st.write("Upload an image to predict the face direction (top, bottom, left, right).")

# Image uploader
uploaded_image = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_image is not None:
    # Display the uploaded image
    st.image(uploaded_image, caption="Uploaded Image", use_container_width=True)

    # Preprocess and predict
    image = Image.open(uploaded_image)
    prediction = predict_face_direction(image)

    # Map the prediction to the face direction
    predicted_class = directions[np.argmax(prediction)]

    # Display the prediction result
    st.write(f"Predicted face direction: {predicted_class}")

    # Optionally, show the model's confidence (probabilities)
    st.write(f"Prediction probabilities: {prediction[0]}")

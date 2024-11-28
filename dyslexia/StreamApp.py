import streamlit as st
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
from PIL import Image

# Load the trained model
MODEL_PATH = 'dyslexia_model.h5'  # Path to your saved model
model = load_model(MODEL_PATH)

# Class names (adjust according to your dataset)
CLASS_NAMES = ['Corrected', 'Normal', 'Reversal']

# Function to preprocess the uploaded image
def preprocess_image(uploaded_image):
    # Ensure the image has 3 channels (convert grayscale to RGB if necessary)
    if uploaded_image.mode != 'RGB':
        uploaded_image = uploaded_image.convert('RGB')  # Convert to RGB

    # Resize to match the input shape of the model
    img = uploaded_image.resize((128, 128))
    img_array = image.img_to_array(img)  # Convert to array
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    img_array /= 255.0  # Normalize
    return img_array

# Streamlit app
st.title("Dyslexia Prediction App")
st.write("Upload a handwritten image, and the model will predict the category: Corrected, Normal, or Reversal.")

# File uploader
uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # Display uploaded image
    image_to_predict = Image.open(uploaded_file)
    st.image(image_to_predict, caption="Uploaded Image", use_container_width=True)
    st.write("")
    st.write("Classifying...")

    # Preprocess the image and make a prediction
    preprocessed_image = preprocess_image(image_to_predict)
    predictions = model.predict(preprocessed_image)
    predicted_class = CLASS_NAMES[np.argmax(predictions)]
    confidence = np.max(predictions)

    # Display prediction
    st.write(f"**Predicted Class:** {predictions}")
    st.write(f"**Predicted Class:** {predicted_class}")
    st.write(f"**Confidence:** {confidence:.2f}")

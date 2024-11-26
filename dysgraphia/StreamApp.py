import streamlit as st
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
import numpy as np
import cv2
from PIL import Image
from collections import Counter

# Load the trained model
model = load_model("handwriting_dysgraphia_model.h5")

# Define class labels
class_labels = ['Low Potential Dysgraphia', 'Potential Dysgraphia']

# Function to segment words in an image
def segment_words(image):
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Apply binary thresholding
    _, binary = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY_INV)
    # Find contours
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    word_segments = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        # Filter small noise
        if w > 20 and h > 20:  # Adjust thresholds as needed
            word = image[y:y+h, x:x+w]
            word_segments.append(word)
    return word_segments

# Preprocess each segmented word
def preprocess_image(image):
    # Segment words in the image
    word_segments = segment_words(image)
    
    processed_words = []
    for word in word_segments:
        # Resize each word to the input size of the model
        word_resized = cv2.resize(word, (150, 150))
        
        # Convert to grayscale and normalize
        word_gray = cv2.cvtColor(word_resized, cv2.COLOR_BGR2GRAY)
        word_normalized = word_gray / 255.0
        
        # Reshape for CNN (150x150x1)
        word_normalized = np.expand_dims(word_normalized, axis=-1)
        
        # Add to list of processed words
        processed_words.append(word_normalized)
    
    return np.array(processed_words)

# Streamlit app
st.title("Handwriting Dysgraphia Analysis")
st.write("Upload a handwriting image to analyze whether it indicates Low Potential or Potential Dysgraphia.")

# Upload image
uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # Display uploaded image
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_container_width=True)
    
    # Convert the PIL image to OpenCV format for processing
    opencv_image = np.array(image)
    opencv_image = cv2.cvtColor(opencv_image, cv2.COLOR_RGB2BGR)
    
    # Preprocess the image (segment words and preprocess each word)
    processed_words = preprocess_image(opencv_image)
    
    # Make predictions for each word
    predictions = model.predict(processed_words)
    
    # Get the predicted classes for each word (0 or 1)
    predicted_classes = [int(np.round(prediction[0])) for prediction in predictions]
    
    # Count the occurrences of each class (0 or 1)
    majority_prediction = Counter(predicted_classes).most_common(1)[0][0]
    
    # Get the majority class label
    predicted_class_label = class_labels[majority_prediction]
    
    # Display the majority prediction result
    st.write(f"**Majority Prediction:** {predicted_class_label}")

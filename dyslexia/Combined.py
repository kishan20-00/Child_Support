import streamlit as st
import numpy as np
import cv2
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

# Function to preprocess and segment the characters from the image
def preProcessing(myImage):
    grayImg = cv2.cvtColor(myImage, cv2.COLOR_BGR2GRAY)
    ret, thresh1 = cv2.threshold(grayImg, 0, 255, cv2.THRESH_OTSU | cv2.THRESH_BINARY_INV)
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (18, 18))
    dilation = cv2.dilate(thresh1, horizontal_kernel, iterations=1)
    horizontal_contours, _ = cv2.findContours(dilation, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    im2 = myImage.copy()
    for cnt in horizontal_contours:
        x, y, w, h = cv2.boundingRect(cnt)
        im2 = cv2.rectangle(im2, (x, y), (x + w, y + h), (255, 255, 255), 0)
    return im2

# Segment the word (character segmentation)
def seg_word(wordImage):
    grayImg = cv2.cvtColor(wordImage, cv2.COLOR_BGR2GRAY)
    ret, thresh2 = cv2.threshold(grayImg, 0, 255, cv2.THRESH_OTSU | cv2.THRESH_BINARY_INV)
    vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (8, 10))
    dilation = cv2.dilate(thresh2, vertical_kernel, iterations=1)
    vertical_contours, _ = cv2.findContours(dilation, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    word_img = wordImage.copy()
    character_images = []
    for cnt in vertical_contours:
        x, y, w, h = cv2.boundingRect(cnt)
        char_crop = word_img[y:y+h, x:x+w]
        character_images.append(char_crop)  # Collect each character's image
    return character_images

# Function to predict the dyslexia category for a given image
def predict_dyslexia(img):
    preprocessed_image = preprocess_image(img)
    predictions = model.predict(preprocessed_image)
    predicted_class = CLASS_NAMES[np.argmax(predictions)]
    return predicted_class

# Streamlit app
st.title("Dyslexia Prediction App")
st.write("Upload a handwritten image, and the model will predict the category: Corrected, Normal, or Reversal.")

# File uploader
uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # Display uploaded image
    image_to_predict = Image.open(uploaded_file)
    st.image(image_to_predict, caption="Uploaded Image", use_container_width=True)
    st.write("Segmenting characters...")

    # Convert uploaded image to OpenCV format
    opencv_image = np.array(image_to_predict)
    opencv_image = cv2.cvtColor(opencv_image, cv2.COLOR_RGB2BGR)

    # Perform character segmentation
    segmented_image = preProcessing(opencv_image)

    # Show segmented image
    st.image(segmented_image, caption="Segmented Image", use_container_width=True)
    st.write("")

    # Segment the word into individual characters
    character_images = seg_word(segmented_image)

    # Prepare to store results
    predictions = []

    # Loop through the segmented characters and predict
    st.write("Classifying characters...")

    # Predict for each character
    for i, char_image in enumerate(character_images):
        pil_char_image = Image.fromarray(char_image)
        predicted_class = predict_dyslexia(pil_char_image)
        predictions.append(predicted_class)

    # Calculate the percentage participation of each class
    class_counts = {class_name: predictions.count(class_name) for class_name in CLASS_NAMES}
    total_predictions = len(predictions)
    
    class_percentages = {class_name: (count / total_predictions) * 100 for class_name, count in class_counts.items()}

    # Display the participation percentages of each class
    st.write("**Class Participation Percentages:**")
    for class_name, percentage in class_percentages.items():
        st.write(f"{class_name}: {percentage:.2f}%")

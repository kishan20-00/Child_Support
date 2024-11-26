import numpy as np
import cv2
from tensorflow.keras.models import load_model
from PIL import Image

# Load the pre-trained Keras model for face direction
model = load_model('face_direction_model_final.h5')  # Ensure this is the correct model file path

# Correct face directions mapping (bottom, left, right, top)
directions = ['bottom', 'left', 'right', 'top']

# Function to preprocess the input image
def preprocess_image(image):
    # Resize the image to match the size used during training (64x64)
    resized_img = image.resize((64, 64))
    # Convert image to RGB (in case it's not already in RGB)
    rgb_img = resized_img.convert('RGB')
    # Convert image to numpy array
    np_img = np.array(rgb_img)
    # Normalize pixel values
    normalized_img = np_img / 255.0
    return normalized_img

# Function to predict face direction using the loaded model
def predict_face_direction(image):
    preprocessed_img = preprocess_image(image)
    # Add batch dimension
    preprocessed_img = np.expand_dims(preprocessed_img, axis=0)
    # Reshape to match model input shape (1, 64, 64, 3)
    preprocessed_img = preprocessed_img.reshape(1, 64, 64, 3)
    prediction = model.predict(preprocessed_img)
    return prediction

# Initialize video capture from webcam
cap = cv2.VideoCapture(0)  # Change the index if you have multiple webcams

while True:
    # Capture frame-by-frame
    ret, frame = cap.read()

    # Convert OpenCV image (numpy array) to PIL image
    pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

    # Predict using the loaded model
    prediction = predict_face_direction(pil_img)
    
    # Get the predicted direction (bottom, left, right, top)
    predicted_class = directions[np.argmax(prediction)]

    # Display the prediction result on the frame
    if predicted_class == 'bottom':
        cv2.putText(frame, 'Face Direction: Bottom', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
    elif predicted_class == 'left':
        cv2.putText(frame, 'Face Direction: Left', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2, cv2.LINE_AA)
    elif predicted_class == 'right':
        cv2.putText(frame, 'Face Direction: Right', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2, cv2.LINE_AA)
    elif predicted_class == 'top':
        cv2.putText(frame, 'Face Direction: Top', (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
    
    # Display the resulting frame
    cv2.imshow('Face Direction Detection', frame)
    
    # Break the loop when 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the capture and close windows
cap.release()
cv2.destroyAllWindows()

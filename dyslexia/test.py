import requests

# Define the Flask API endpoint
url = "http://127.0.0.1:5005/predict"  # Update if hosted elsewhere

# Path to the test image
image_path = "handwritten.jpg"  # Replace with an actual image file

# Open the image file in binary mode
with open(image_path, "rb") as img_file:
    files = {"file": img_file}
    response = requests.post(url, files=files)

# Print the response from the server
if response.status_code == 200:
    print("Prediction Output:", response.json())
else:
    print("Error:", response.status_code, response.text)

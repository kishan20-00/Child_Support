import requests

# Define the URL of the Flask app
url = "http://127.0.0.1:5004/predict"  # Change this if your Flask app is hosted elsewhere

# Path to the test image
image_path = "handwritten.jpg"  # Replace with the actual test image path

# Open the image file in binary mode
with open(image_path, "rb") as img_file:
    files = {"file": img_file}
    response = requests.post(url, files=files)

# Print the response from the server
if response.status_code == 200:
    print("Prediction:", response.json())
else:
    print("Error:", response.status_code, response.text)

import requests

# Define the URL of the Flask app
url = 'http://127.0.0.1:5000/predict'

# Path to the image file you want to test
image_path = '1_52.png'  # Replace with the path to your image

# Open the image file in binary mode
with open(image_path, 'rb') as file:
    files = {'file': file}
    # Send a POST request to the Flask app
    response = requests.post(url, files=files)

# Check the response
if response.status_code == 200:
    # Print the prediction result
    result = response.json()
    print("Prediction Result:")
    print(f"Predicted Class: {result['predicted_class']}")
    print(f"Confidence: {result['confidence']:.2f}")
else:
    # Print the error message
    print(f"Error: {response.status_code}")
    print(response.json())
import requests

# Define the URL of the Flask app
url = 'http://127.0.0.1:5005/predict'

# Path to the image file you want to test
image_path = 'handwritten.jpg'  # Replace with the path to your image

# Open the image file in binary mode
with open(image_path, 'rb') as file:
    files = {'file': file}
    # Send a POST request to the Flask app
    response = requests.post(url, files=files)

# Check the response
if response.status_code == 200:
    # Print the prediction percentages
    result = response.json()
    percentages = result['percentages']
    print("Prediction Percentages:")
    print(f"Corrected: {percentages['Corrected']:.2f}%")
    print(f"Reversal: {percentages['Reversal']:.2f}%")
    print(f"Normal: {percentages['Normal']:.2f}%")
else:
    # Print the error message
    print(f"Error: {response.status_code}")
    print(response.json())
import requests
import os
from PIL import Image
import io

# API endpoint
API_URL = "http://localhost:5010/predict"

# Path to your test image
IMAGE_PATH = "handwritten.jpg"  # Replace with your test image path

def test_handwriting_api(image_path):
    # Check if image exists
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return
    
    try:
        # Open the image file
        with open(image_path, 'rb') as img_file:
            # Prepare the request
            files = {'file': (os.path.basename(image_path), img_file, 'image/jpeg')}
            
            # Send POST request
            print(f"Sending request to {API_URL} with image: {image_path}")
            response = requests.post(API_URL, files=files)
            
            # Check response status
            if response.status_code == 200:
                result = response.json()
                print("\nSuccess! API Response:")
                print(f"Prediction: {result['prediction']}")
                print(f"Review: {result['review']}")
            else:
                print(f"\nError: {response.status_code}")
                print(response.json())
    
    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")

if __name__ == "__main__":
    # Test the API
    test_handwriting_api(IMAGE_PATH)
import requests

# Define the API URL
url = "http://127.0.0.1:5003/predict"

# Define query parameters
params = {
    "Number comparison": 1,
    "Number line placement": 0,
    "Number matching": 1,
    "Quick dot recognition": 0,
    "Number sorting in ascending order": 1,
    "Number sorting in descending order": 0,
    "Addition with counters": 1,
    "Subtraction story problem": 0,
    "Match the equation": 1,
    "Make a number by adding two numbers": 0,
    "Roll two dice and add the values": 1,
    "Group of objects counting": 0,
    "Pattern recognition": 1,
    "Find differences between two images": 0,
    "Find the bends in a string": 1,
    "Count legs of animals": 0,
    "Measure objects with units": 1,
    "Rearrange numbers by dragging": 0
}

# Send GET request
response = requests.get(url, params=params)

# Print the response
if response.status_code == 200:
    print("Prediction Response:", response.json())
else:
    print("Error:", response.status_code, response.text)

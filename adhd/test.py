import requests

# Define the API URL
url = "http://127.0.0.1:5002/predict"

# Define query parameters
params = {
    "differences_of_two_pictures": 5,
    "time_taken_to_find_the_object": 30,
    "find_the_object": "Yes",
    "eye_tracking": "Focus"
}

# Send GET request
response = requests.get(url, params=params)

# Print the response
if response.status_code == 200:
    print("Prediction Response:", response.json())
else:
    print("Error:", response.status_code, response.text)
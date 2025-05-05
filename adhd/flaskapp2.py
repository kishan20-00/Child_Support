import joblib
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load the saved model and encoder
loaded_model = joblib.load('Logistic Regression_model.pkl')
loaded_encoder = joblib.load('label_encoder.pkl')

@app.route('/predict', methods=['GET'])
def predict():
    try:
        # Get input parameters from request
        differences_of_two_pictures = int(request.args.get('differences_of_two_pictures', 5))
        time_taken_to_find_the_object = int(request.args.get('time_taken_to_find_the_object', 30))
        find_the_object = request.args.get('find_the_object', 'Yes')
        eye_tracking = request.args.get('eye_tracking', 'Focus')
        
        # Create a DataFrame for the input
        new_data = pd.DataFrame({
            'Differences of Two Pictures': [differences_of_two_pictures],
            'Time Taken to Find the Object': [time_taken_to_find_the_object],
            'Find the Object': [find_the_object],
            'Eye Tracking': [eye_tracking]
        })
        
        # Predict using the loaded model
        new_data_encoded = loaded_model.predict(new_data)
        predicted_class = loaded_encoder.inverse_transform(new_data_encoded)
        
        return jsonify({'prediction': predicted_class[0]})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
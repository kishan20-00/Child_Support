import pickle
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load the best model from the saved file
with open('best_model.pkl', 'rb') as f:
    best_model = pickle.load(f)

# Define column names (features)
columns = [
    "Quick dot recognition",
    "addition",
    "subtraction",
    "object divison",
    "count apples",
    "number line addition",
    "pattern recognition",
    "guess object count",
    "number pattern",
    "money question",
    "object value assign",
    "increse order",
    "decrese order",
    "length"
]

@app.route('/predict', methods=['GET'])
def predict():
    try:
        # Get input values from request parameters
        input_values = [int(request.args.get(col, 0)) for col in columns]
        
        # Convert to numpy array for model prediction
        sample_values = np.array([input_values])
        
        # Make predictions using the model
        prediction = best_model.predict(sample_values)
        
        return jsonify({'prediction': int(prediction[0])})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5003)

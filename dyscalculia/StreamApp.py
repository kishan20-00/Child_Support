import streamlit as st
import pickle
import numpy as np

# Load the best model from the saved file
with open('best_model.pkl', 'rb') as f:
    best_model = pickle.load(f)

# Define column names (features)
columns = [
    "Number comparison",
    "Number line placement",
    "Number matching",
    "Quick dot recognition",
    "Number sorting in ascending order",
    "Number sorting in descending order",
    "Addition with counters",
    "Subtraction story problem",
    "Match the equation",
    "Make a number by adding two numbers",
    "Roll two dice and add the values",
    "Group of objects counting",
    "Pattern recognition",
    "Find differences between two images",
    "Find the bends in a string",
    "Count legs of animals",
    "Measure objects with units",
    "Rearrange numbers by dragging"
]

# Streamlit app interface
st.title("Model Prediction App")

st.write("Please select values for the following features:")

# Collect user inputs for each feature using dropdowns
user_input = {}
for column in columns:
    user_input[column] = st.selectbox(column, [0, 1], index=0)  # Default to 0

# Convert the user input into a 2D array for prediction
sample_values = np.array([list(user_input.values())])

# Display the input values for user reference
st.write("### Input Values:")
st.write(user_input)

# Button to make predictions
if st.button("Make Prediction"):
    # Make predictions using the loaded model
    predictions = best_model.predict(sample_values)

    # Display the predicted output
    st.write("### Predicted Output:")
    st.write(predictions[0])  # Assuming binary classification (0 or 1)

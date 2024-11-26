import streamlit as st
import pandas as pd
import joblib

# Load the saved model and encoder
loaded_model = joblib.load('Logistic Regression_model.pkl')
loaded_encoder = joblib.load('label_encoder.pkl')

# Streamlit app
st.title("Model Prediction App")

st.header("Provide Input Features")

# Create input fields for the features
differences_of_two_pictures = st.number_input(
    "Differences of Two Pictures", min_value=0, step=1, value=5
)
time_taken_to_find_the_object = st.number_input(
    "Time Taken to Find the Object (seconds)", min_value=0, step=1, value=30
)
find_the_object = st.selectbox(
    "Find the Object (Yes/No)", options=['Yes', 'No']
)
eye_tracking = st.selectbox(
    "Eye Tracking", options=['Focus', 'Not']  # Adjust options as per dataset
)

# Create a button for prediction
if st.button("Predict"):
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

    # Display the prediction
    st.success(f"The predicted class is: **{predicted_class[0]}**")

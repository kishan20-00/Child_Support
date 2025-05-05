import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';

const DyscalculiaIdentify = () => {
  // Define the columns (features) from your Flask app
  const columns = [
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
  ];

  // State to store input values
  const [inputValues, setInputValues] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);

  // Handle input changes
  const handleInputChange = (column, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [column]: value,
    }));
  };

  // Handle prediction
  const handlePredict = async () => {
    try {
      // Prepare the input data for the Flask app
      const inputData = {};
      columns.forEach((col) => {
        inputData[col] = inputValues[col] || 0; // Default to 0 if no input
      });

      // Send request to Flask app
      const response = await axios.get('http://192.168.1.100:5003/predict', {
        params: inputData,
      });

      // Display the prediction result with a user-friendly message
      const prediction = response.data.prediction;
      if (prediction === 1) {
        setPredictionResult('There is a high possibility for Dyscalculia.');
      } else if (prediction === 0) {
        setPredictionResult('There is a low possibility for Dyscalculia.');
      } else {
        setPredictionResult('Invalid prediction result.');
      }
    } catch (error) {
      console.error('Error making prediction:', error);
      Alert.alert('Error', 'Failed to make prediction. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Math Skills Prediction</Text>

      {/* Input fields for each column */}
      {columns.map((column, index) => (
        <View key={index} style={styles.inputContainer}>
          <Text style={styles.label}>{column}:</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${column}`}
            keyboardType="numeric"
            value={inputValues[column] ? String(inputValues[column]) : ''}
            onChangeText={(text) => handleInputChange(column, text)}
          />
        </View>
      ))}

      {/* Button to Trigger Prediction */}
      <TouchableOpacity style={styles.button} onPress={handlePredict}>
        <Text style={styles.buttonText}>Predict</Text>
      </TouchableOpacity>

      {/* Display Prediction Result */}
      {predictionResult !== null && (
        <Text style={styles.result}>{predictionResult}</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});

export default DyscalculiaIdentify;
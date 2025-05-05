import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';

const ADHDIdentity = () => {
  const [differences, setDifferences] = useState('');
  const [timeTaken, setTimeTaken] = useState('');
  const [findObjectOpen, setFindObjectOpen] = useState(false);
  const [findObjectValue, setFindObjectValue] = useState('Yes');
  const [findObjectItems, setFindObjectItems] = useState([
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ]);
  const [eyeTrackingOpen, setEyeTrackingOpen] = useState(false);
  const [eyeTrackingValue, setEyeTrackingValue] = useState('Focus');
  const [eyeTrackingItems, setEyeTrackingItems] = useState([
    { label: 'Focus', value: 'Focus' },
    { label: 'Not Focus', value: 'Not Focus' },
  ]);
  const [predictionResult, setPredictionResult] = useState(null);

  const handlePredict = async () => {
    try {
      // Validate inputs
      if (!differences || !timeTaken) {
        Alert.alert('Error', 'Please fill in all fields.');
        return;
      }

      // Send request to Flask app
      const response = await axios.get('http://192.168.1.100:5002/predict', {
        params: {
          differences_of_two_pictures: differences,
          time_taken_to_find_the_object: timeTaken,
          find_the_object: findObjectValue,
          eye_tracking: eyeTrackingValue,
        },
      });

      // Display the prediction result
      setPredictionResult(response.data.prediction);
    } catch (error) {
      console.error('Error making prediction:', error);
      Alert.alert('Error', 'Failed to make prediction. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ADHD Identification</Text>

      {/* Input for Differences of Two Pictures */}
      <TextInput
        style={styles.input}
        placeholder="Differences of Two Pictures"
        keyboardType="numeric"
        value={differences}
        onChangeText={setDifferences}
      />

      {/* Input for Time Taken to Find the Object */}
      <TextInput
        style={styles.input}
        placeholder="Time Taken to Find the Object"
        keyboardType="numeric"
        value={timeTaken}
        onChangeText={setTimeTaken}
      />

      {/* Dropdown for Find the Object */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Find the Object:</Text>
        <DropDownPicker
          open={findObjectOpen}
          value={findObjectValue}
          items={findObjectItems}
          setOpen={setFindObjectOpen}
          setValue={setFindObjectValue}
          setItems={setFindObjectItems}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownMenu}
          placeholder="Select an option"
          dropDownDirection='TOP'
        />
      </View>

      {/* Dropdown for Eye Tracking */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Eye Tracking:</Text>
        <DropDownPicker
          open={eyeTrackingOpen}
          value={eyeTrackingValue}
          items={eyeTrackingItems}
          setOpen={setEyeTrackingOpen}
          setValue={setEyeTrackingValue}
          setItems={setEyeTrackingItems}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownMenu}
          placeholder="Select an option"
          dropDownDirection='TOP'
        />
      </View>

      {/* Button to Trigger Prediction */}
      <TouchableOpacity style={styles.button} onPress={handlePredict}>
        <Text style={styles.buttonText}>Predict</Text>
      </TouchableOpacity>

      {/* Display Prediction Result */}
      {predictionResult && (
        <Text style={styles.result}>Prediction Result: {predictionResult}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 15,
    zIndex: 1, // Ensure dropdowns don't overlap
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  dropdown: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  dropdownMenu: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 5,
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
  },
});

export default ADHDIdentity;
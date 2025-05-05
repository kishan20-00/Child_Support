import React, { useState } from 'react';
import { View, Image, Alert, ScrollView, StyleSheet } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const DysgraphiaPredictionPage = () => {
  const [imageUri, setImageUri] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to pick an image from the gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setPredictionResult(null); // Clear previous result
    }
  };

  // Function to capture an image using the camera
  const captureImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setPredictionResult(null); // Clear previous result
    }
  };

  // Function to upload image to the Flask backend
  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please select or capture an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/png',
      name: 'uploaded_image.png',
    });

    try {
      setLoading(true);

      // Send the image to the Flask app
      const response = await axios.post('http://192.168.1.100:5004/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Set the prediction result
      setPredictionResult(response.data.prediction);
    } catch (error) {
      console.error('Error making prediction:', error);
      Alert.alert('Error', 'Failed to process the image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Dysgraphia Prediction
      </Text>

      {/* Display the selected image */}
      {imageUri && (
        <Card style={styles.imageCard}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </Card>
      )}

      {/* Buttons for image selection and prediction */}
      <Button mode="contained" onPress={pickImage} style={styles.button} icon="image">
        Choose from Gallery
      </Button>
      <Button mode="contained" onPress={captureImage} style={styles.button} icon="camera">
        Capture Image
      </Button>
      <Button
        mode="contained"
        onPress={uploadImage}
        loading={loading}
        disabled={loading}
        style={styles.button}
        icon="upload"
      >
        {loading ? 'Processing...' : 'Predict Dysgraphia'}
      </Button>

      {/* Display the prediction result */}
      {predictionResult && (
        <Card style={styles.resultCard}>
          <Text variant="bodyLarge" style={styles.resultText}>
            Prediction: {predictionResult}
          </Text>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  imageCard: {
    marginBottom: 20,
    elevation: 3,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
  },
  button: {
    marginVertical: 8,
    width: '90%',
    borderRadius: 8,
  },
  resultCard: {
    marginTop: 20,
    padding: 15,
    width: '90%',
    backgroundColor: '#fff',
    elevation: 3,
  },
  resultText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
});

export default DysgraphiaPredictionPage;
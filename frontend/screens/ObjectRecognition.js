import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';

const ObjectPronunciationScreen = () => {
  // List of objects with emojis and names
  const objects = [
    { emoji: '🍎', name: ' Apple' },
    { emoji: '🐶', name: ' Dog' },
    { emoji: '🚗', name: ' Car' },
    { emoji: '🏠', name: ' house' },
    { emoji: '🌳', name: ' Tree' },
  ];

  // State to manage recording and results
  const [recording, setRecording] = useState(null);
  const [currentObjectIndex, setCurrentObjectIndex] = useState(0);
  const [results, setResults] = useState({ correct: 0, incorrect: 0, performance: null });
  const [isRecording, setIsRecording] = useState(false);

  // Start recording
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  // Stop recording and send audio to Flask app
  const stopRecording = async () => {
    try {
      if (!recording) {
        console.log('No recording to stop.');
        return;
      }

      console.log('Stopping recording...');
      await recording.stopAndUnloadAsync();
      setIsRecording(false);

      const uri = recording.getURI();
      console.log('Recording URI:', uri);

      // Send the audio file to the Flask app
      const transcription = await transcribeAudio(uri);

      // Check if the object name was pronounced correctly
      const currentObject = objects[currentObjectIndex];
      const isCorrect = transcription.toLowerCase() === currentObject.name.toLowerCase();

      // Update results
      if (isCorrect) {
        setResults((prev) => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setResults((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }

      // Move to the next object
      if (currentObjectIndex < objects.length - 1) {
        setCurrentObjectIndex(currentObjectIndex + 1);
      } else {
        // All objects completed, calculate performance
        calculatePerformance();
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
    }
  };

  // Transcribe audio using Flask app
  const transcribeAudio = async (uri) => {
    try {
      const formData = new FormData();

      // Append the file correctly
      formData.append('file', {
        uri: uri,
        name: 'recording.m4a', // Ensure the file name has the correct extension
        type: 'audio/m4a', // Ensure the MIME type is correct
      });

      console.log('Sending file to Flask server...');

      const response = await axios.post('http://192.168.1.100:5008/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response from Flask server:', response.data);
      return response.data.transcription;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
      return '';
    }
  };

  // Calculate performance
  const calculatePerformance = () => {
    const totalObjects = objects.length;
    const correctPercentage = (results.correct / totalObjects) * 100;

    if (correctPercentage >= 70) {
      setResults((prev) => ({ ...prev, performance: 'Well done! You performed well.' }));
    } else {
      setResults((prev) => ({ ...prev, performance: 'You need more practice.' }));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Object Pronunciation Test</Text>
      <Text style={styles.instruction}>
        Pronounce the name of the following object:
      </Text>

      {/* Display current object emoji */}
      <Text style={styles.emojiText}>
        {objects[currentObjectIndex].emoji}
      </Text>

      {/* Buttons for recording */}
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
      />

      {/* Display results */}
      {results.performance && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Correct: {results.correct}</Text>
          <Text style={styles.resultText}>Incorrect: {results.incorrect}</Text>
          <Text style={styles.finalReview}>{results.performance}</Text>
        </View>
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
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  emojiText: {
    fontSize: 64,
    marginBottom: 20,
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 10,
  },
  finalReview: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
});

export default ObjectPronunciationScreen;
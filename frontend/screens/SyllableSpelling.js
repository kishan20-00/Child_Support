import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';

const SyllableSpeakingScreen = () => {
  // List of syllables for the user to pronounce
  const syllables = [' ba', ' ta', ' ka', ' ma', ' la', ' sa', ' na', ' pa', ' da', ' ga'];

  // State to manage recording and results
  const [recording, setRecording] = useState(null);
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(0);
  const [results, setResults] = useState({ errors: 0, dyslexiaPotential: null });
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

      // Check if the syllable was pronounced correctly
      const currentSyllable = syllables[currentSyllableIndex];
      const isCorrect = transcription.toLowerCase() === currentSyllable.toLowerCase();

      // Update errors count
      if (!isCorrect) {
        setResults((prev) => ({ ...prev, errors: prev.errors + 1 }));
      }

      // Move to the next syllable
      if (currentSyllableIndex < syllables.length - 1) {
        setCurrentSyllableIndex(currentSyllableIndex + 1);
      } else {
        // All syllables completed, calculate dyslexia potential
        calculateDyslexiaPotential();
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

  // Calculate dyslexia potential
  const calculateDyslexiaPotential = () => {
    const errorThreshold = 3; // Example threshold for errors
    const dyslexiaPotential = results.errors > errorThreshold ? 'High potential of dyslexia' : 'Low potential of dyslexia';
    setResults((prev) => ({ ...prev, dyslexiaPotential }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Syllable Speaking Test</Text>
      <Text style={styles.instruction}>
        Pronounce the following syllable:
      </Text>

      {/* Display current syllable */}
      <Text style={styles.syllableText}>
        {syllables[currentSyllableIndex]}
      </Text>

      {/* Buttons for recording */}
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
      />

      {/* Display results */}
      {results.dyslexiaPotential && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Errors: {results.errors}</Text>
          <Text style={styles.finalReview}>Final Review: {results.dyslexiaPotential}</Text>
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
  syllableText: {
    fontSize: 32,
    fontWeight: 'bold',
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

export default SyllableSpeakingScreen;
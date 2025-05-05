import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';

const SpeechDyslexiaPage = () => {
  const [recording, setRecording] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [results, setResults] = useState({ pauses: 0, mispronunciations: 0, skippedWords: 0 });
  const [isRecording, setIsRecording] = useState(false);
  const [dyslexiaPotential, setDyslexiaPotential] = useState(null);

  const textPrompt = " The quick brown fox jumps over the lazy dog";

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

  // Stop recording and transcribe audio
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
      setTranscribedText(transcription);

      // Analyze the speech
      analyzeSpeech(transcription);
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

  // Analyze the transcribed text
  const analyzeSpeech = (transcription) => {
    // Pause detection: Count occurrences of more than one consecutive space
    const pauseRegex = / {2,}/g; // Matches 2 or more consecutive spaces
    const pauses = (transcription.match(pauseRegex) || []).length;
    setResults((prev) => ({ ...prev, pauses }));

    // Skipped words detection
    const expectedWords = textPrompt.split(' ');
    const transcribedWords = transcription.split(' ');
    const skippedWords = expectedWords.filter((word) => !transcribedWords.includes(word)).length;
    setResults((prev) => ({ ...prev, skippedWords }));

    // Mispronunciation detection
    const mispronunciations = transcribedWords.filter((word) => !expectedWords.includes(word)).length;
    setResults((prev) => ({ ...prev, mispronunciations }));

    // Calculate dyslexia potential
    calculateDyslexiaPotential(pauses, skippedWords, mispronunciations);
  };

  // Calculate dyslexia potential
  const calculateDyslexiaPotential = (pauses, skippedWords, mispronunciations) => {
    // Define thresholds for each metric
    const pauseThreshold = 2; // Example threshold for pauses
    const skippedWordsThreshold = 2; // Example threshold for skipped words
    const mispronunciationsThreshold = 3; // Example threshold for mispronunciations

    // Determine dyslexia potential
    if (
      pauses > pauseThreshold ||
      skippedWords > skippedWordsThreshold ||
      mispronunciations > mispronunciationsThreshold
    ) {
      setDyslexiaPotential('High potential of dyslexia');
    } else {
      setDyslexiaPotential('Low potential of dyslexia');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Speech Dyslexia Detection</Text>
      <Text>Read the text:</Text>
      <Text style={styles.prompt}>{textPrompt}</Text>

      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
      />

      {transcribedText && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Transcribed Text: {transcribedText}</Text>
          <Text style={styles.resultText}>Pauses: {results.pauses}</Text>
          <Text style={styles.resultText}>Skipped Words: {results.skippedWords}</Text>
          <Text style={styles.resultText}>Mispronunciations: {results.mispronunciations}</Text>
          {dyslexiaPotential && (
            <Text style={styles.finalReview}>Final Review: {dyslexiaPotential}</Text>
          )}
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
  prompt: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 10,
  },
  finalReview: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#6200ee',
  },
});

export default SpeechDyslexiaPage;
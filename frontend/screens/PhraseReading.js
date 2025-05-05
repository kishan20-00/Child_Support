import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';

const PhraseReadingScreen = () => {
  // List of phrases for the user to read
  const phrases = [
    " The quick brown fox jumps over the lazy dog",
    " She sells seashells by the seashore",
    " How much wood would a woodchuck chuck",
    " Peter Piper picked a peck of pickled peppers",
    " A stitch in time saves nine",
  ];

  // State to manage recording and results
  const [recording, setRecording] = useState(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [results, setResults] = useState({ correct: 0, incorrect: 0, performance: null });
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [highlightedText, setHighlightedText] = useState([]);

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
      setTranscribedText(transcription);

      // Check if the phrase was read correctly
      const currentPhrase = phrases[currentPhraseIndex];
      const isCorrect = transcription.toLowerCase() === currentPhrase.toLowerCase();

      // Update results
      if (isCorrect) {
        setResults((prev) => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setResults((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }

      // Highlight differences between transcribed text and true text
      highlightDifferences(currentPhrase, transcription);

      // Move to the next phrase
      if (currentPhraseIndex < phrases.length - 1) {
        setCurrentPhraseIndex(currentPhraseIndex + 1);
      } else {
        // All phrases completed, calculate performance
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

  // Highlight differences between true text and transcribed text
  const highlightDifferences = (trueText, transcribedText) => {
    const trueWords = trueText.toLowerCase().split(' ');
    const transcribedWords = transcribedText.toLowerCase().split(' ');
    const highlighted = [];

    for (let i = 0; i < trueWords.length; i++) {
      if (transcribedWords[i] === trueWords[i]) {
        highlighted.push({ text: trueWords[i], isCorrect: true });
      } else {
        highlighted.push({ text: transcribedWords[i] || '', isCorrect: false });
      }
    }

    setHighlightedText(highlighted);
  };

  // Calculate performance
  const calculatePerformance = () => {
    const totalPhrases = phrases.length;
    const correctPercentage = (results.correct / totalPhrases) * 100;

    if (correctPercentage >= 70) {
      setResults((prev) => ({ ...prev, performance: 'Well done! You performed well.' }));
    } else {
      setResults((prev) => ({ ...prev, performance: 'You need more practice.' }));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Phrase Reading Test</Text>
      <Text style={styles.instruction}>
        Read the following phrase aloud:
      </Text>

      {/* Display current phrase */}
      <Text style={styles.phraseText}>
        {phrases[currentPhraseIndex]}
      </Text>

      {/* Buttons for recording */}
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
      />

      {/* Display transcribed text with highlights */}
      {transcribedText && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Transcribed Text:</Text>
          <View style={styles.highlightedTextContainer}>
            {highlightedText.map((word, index) => (
              <Text
                key={index}
                style={[
                  styles.highlightedWord,
                  word.isCorrect ? styles.correctWord : styles.incorrectWord,
                ]}
              >
                {word.text}{' '}
              </Text>
            ))}
          </View>
        </View>
      )}

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
  phraseText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 10,
  },
  highlightedTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  highlightedWord: {
    fontSize: 16,
  },
  correctWord: {
    color: 'green',
  },
  incorrectWord: {
    color: 'red',
    textDecorationLine: 'underline',
  },
  finalReview: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
});

export default PhraseReadingScreen;
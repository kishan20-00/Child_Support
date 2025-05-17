import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

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
  const [latestScores, setLatestScores] = useState({
    'Find the Difference': null,
    'Find the Object': null,
    'ADHD Quiz': null
  });
  const [loadingScores, setLoadingScores] = useState(true);

  // Fetch latest scores from Firebase
  const fetchLatestScores = async () => {
    try {
      setLoadingScores(true);
      const user = auth.currentUser;
      if (!user?.email) return;

      const userEmail = user.email;
      const scores = {
        'Find the Difference': null,
        'Find the Object': null,
        'ADHD Quiz': null
      };

      // Configuration for the first 3 games
      const gameConfig = {
        'adhd_scores': {
          name: 'Find the Difference',
          scoreField: 'score'
        },
        'focus': {
          name: 'Find the Object',
          scoreField: 'result'
        },
        'ADHD_quiz': {
          name: 'ADHD Quiz',
          scoreField: 'tIndex'
        }
      };

      for (const [gameId, config] of Object.entries(gameConfig)) {
        const collectionRef = collection(db, gameId);
        const querySnapshot = await getDocs(collectionRef);

        querySnapshot.forEach((docSnap) => {
          if (docSnap.id === userEmail) {
            const attempts = docSnap.data().attempts || [];
            if (attempts.length > 0) {
              const latestAttempt = attempts[attempts.length - 1]; // Get most recent attempt
              scores[config.name] = latestAttempt[config.scoreField];
              
              // Special handling for Find the Object game
              if (config.name === 'Find the Object') {
                const timeTakenValue = latestAttempt.timeTaken || '';
                setTimeTaken(timeTakenValue.toString());
              }
            }
          }
        });
      }

      setLatestScores(scores);
      
      // Auto-fill the form fields with the latest scores
      if (scores['Find the Difference']) {
        setDifferences(scores['Find the Difference'].toString());
      }
      
      if (scores['Find the Object']) {
        // Set to 'Yes' if result is found, otherwise 'No'
        const resultValue = scores['Find the Object'] === 'Yes' ? 'Yes' : 'No';
        setFindObjectValue(resultValue);
      }
      
      if (scores['ADHD Quiz']) {
        // You can use the ADHD Quiz score for another field if needed
      }
      
    } catch (error) {
      console.error('Error fetching latest scores:', error);
    } finally {
      setLoadingScores(false);
    }
  };

  useEffect(() => {
    fetchLatestScores();
  }, []);

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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>ADHD Identification</Text>

        {/* Latest Scores Section */}
        <View style={styles.scoresContainer}>
          <Text style={styles.sectionTitle}>Latest Game Scores</Text>
          {loadingScores ? (
            <Text style={styles.loadingText}>Loading latest scores...</Text>
          ) : (
            <>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Find the Difference:</Text>
                <Text style={styles.scoreValue}>
                  {latestScores['Find the Difference'] !== null ? latestScores['Find the Difference'] : 'No data'}
                </Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Find the Object:</Text>
                <Text style={styles.scoreValue}>
                  {latestScores['Find the Object'] !== null ? latestScores['Find the Object'] : 'No data'}
                </Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>ADHD Quiz:</Text>
                <Text style={styles.scoreValue}>
                  {latestScores['ADHD Quiz'] !== null ? latestScores['ADHD Quiz'] : 'No data'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Prediction Form */}
        <Text style={styles.sectionTitle}>Prediction Form</Text>

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
          placeholder="Time Taken to Find the Object (seconds)"
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
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Prediction Result:</Text>
            <Text style={[
              styles.resultValue,
              predictionResult === 'ADHD' ? styles.adhdResult : styles.nonAdhdResult
            ]}>
              {predictionResult}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
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
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#007BFF',
    alignSelf: 'flex-start',
  },
  scoresContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#555',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    zIndex: 1,
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
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
    height: 45,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  adhdResult: {
    color: '#C62828', // Red for ADHD
  },
  nonAdhdResult: {
    color: '#2E7D32', // Green for non-ADHD
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default ADHDIdentity;
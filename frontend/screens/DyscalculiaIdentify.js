import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl
} from 'react-native';
import axios from 'axios';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const DyscalculiaIdentify = () => {
  const columns = [
    'Quick dot recognition',
    'addition',
    'subtraction',
    'object divison',
    'count apples',
    'number line addition',
    'pattern recognition',
    'guess object count',
    'number pattern',
    'money question',
    'object value assign',
    'increse order',
    'decrese order',
    'length',
  ];

  const [inputValues, setInputValues] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScoresAndPredict = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user?.email) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      const userEmail = user.email;

      const collectionToColumnMapping = {
        dot_counting: 'Quick dot recognition',
        number_line_game: 'number line addition',
        subtraction_story: 'subtraction',
        object_division: 'object divison',
        count_apples: 'count apples',
        addition_game: 'addition',
        emoji_pattern_game: 'pattern recognition',
        count_objects_game: 'guess object count',
        number_comparison: 'number pattern',
        money_game: 'money question',
        match_the_equation: 'object value assign',
        number_sorting: 'increse order',
        number_sorting_desc: 'decrese order',
        measure_objects_game: 'length',
      };

      const uniqueCollectionNames = Object.keys(collectionToColumnMapping);
      let latestScores = {};

      for (let collectionName of uniqueCollectionNames) {
        const collectionRef = collection(db, collectionName);
        const querySnapshot = await getDocs(collectionRef);

        querySnapshot.forEach((docSnap) => {
          if (docSnap.id === userEmail) {
            const attempts = docSnap.data().attempts || [];
            if (attempts.length > 0) {
              const latestAttempt = attempts[attempts.length - 1];
              const score = latestAttempt.score || 0;
              const columnName = collectionToColumnMapping[collectionName];
              if (columnName) {
                latestScores[columnName] = score;
              }
            }
          }
        });
      }

      setInputValues(latestScores);
      await makePrediction(latestScores);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const makePrediction = async (scores) => {
    try {
      const inputData = {};
      columns.forEach((col) => {
        inputData[col] = scores[col] || 0;
      });

      const response = await axios.get('http://192.168.1.101:5003/predict', {
        params: inputData,
      });

      const prediction = response.data.prediction;
      if (prediction === 1) {
        setPredictionResult('There is a high possibility for Dyscalculia.');
      } else if (prediction === 0) {
        setPredictionResult('There is a low possibility for Dyscalculia.');
      } else {
        setPredictionResult('Unable to determine prediction.');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setPredictionResult('Error in prediction. Please try again.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchScoresAndPredict();
  };

  useEffect(() => {
    fetchScoresAndPredict();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007BFF']}
          tintColor={'#007BFF'}
        />
      }
    >
      <Text style={styles.title}>Dyscalculia Prediction</Text>

      {loading ? (
        <Text style={styles.loadingText}>Loading prediction results...</Text>
      ) : (
        <>
          {predictionResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Prediction Result:</Text>
              <Text style={[
                styles.resultText,
                predictionResult.includes('high possibility') ? styles.highRisk : styles.lowRisk
              ]}>
                {predictionResult}
              </Text>
            </View>
          )}

          <Text style={styles.note}>
            Scores are automatically collected from your game performances.
            Pull down to refresh the prediction.
          </Text>
        </>
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
    textAlign: 'center',
    color: '#333',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
    borderRadius: 5,
  },
  highRisk: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
    fontWeight: 'bold',
  },
  lowRisk: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
  note: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default DyscalculiaIdentify;
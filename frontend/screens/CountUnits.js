import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Correct answer
const correctAnswer = 3;

export default function MeasureObjectsGame() {
  const [userAnswer, setUserAnswer] = useState(null);
  const [user, setUser] = useState(null);
  const [options, setOptions] = useState([]);
  const [timer, setTimer] = useState(60); // Timer starts at 60 seconds
  const [intervalId, setIntervalId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);

    // Options including the correct answer and incorrect ones
    const incorrectAnswers = [
      correctAnswer + 1,
      correctAnswer - 1,
      correctAnswer + 2,
    ];

    // Shuffle answers
    setOptions([correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5));

    startTimer();

    return () => clearInterval(intervalId); // Cleanup interval on unmount or navigation back
  }, []);

  const startTimer = () => {
    const id = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime === 1) {
          clearInterval(id);
          handleTimeUp();
        }
        return prevTime - 1;
      });
    }, 1000);

    setIntervalId(id);
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        clearInterval(intervalId); // Clear interval when user navigates away
      };
    }, [intervalId])
  );

  const handleTimeUp = () => {
    Alert.alert('Time is up!', 'Navigating back to the previous page.');
    navigation.goBack();
  };

  const checkAnswer = async (answer) => {
    if (answer === null) {
      Alert.alert('Please select an answer before submitting!');
      return;
    }

    const isCorrect = answer === correctAnswer;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'measure_objects_game', user.email);
      const userDoc = await getDoc(userRef);
      let newData = { email: user.email, attempts: [] };

      if (userDoc.exists()) {
        newData = userDoc.data();
      }

      newData.attempts.push({
        attempt: newData.attempts.length + 1,
        score,
      });

      await setDoc(userRef, newData);
      Alert.alert(isCorrect ? 'Correct!' : 'Wrong!', `Your score: ${score}`);

      if (isCorrect) {
        navigation.navigate('Dyscalculia');
      } else {
        resetGame();
      }
    }
  };

  const resetGame = () => {
    setUserAnswer(null);
    setTimer(60); // Reset timer
    clearInterval(intervalId);
    startTimer();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>How Many Matchsticks Longer is the Brush Than the Pencil?</Text>
        <Image
          source={require('../assets/Pencil.png')}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Answer Options */}
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionButton, userAnswer === option && styles.selectedOption]}
            onPress={() => setUserAnswer(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.timer}>{`Time Left: ${timer}s`}</Text>

        {/* Submit Answer */}
        <TouchableOpacity style={styles.button} onPress={() => checkAnswer(userAnswer)}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  image: { width: '100%', height: 200, marginBottom: 20 }, // Full width and aspect ratio
  optionButton: {
    padding: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  selectedOption: { backgroundColor: '#388E3C' }, // Color when option is selected
  optionText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  timer: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  button: {
    backgroundColor: '#6200ea',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

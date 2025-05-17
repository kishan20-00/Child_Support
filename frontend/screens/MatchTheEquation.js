import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const fruitValues = {
  '🍎': 2,
  '🍌': 3,
  '🍇': 4,
  '🍉': 5
};

const getRandomFruit = () => {
  const keys = Object.keys(fruitValues);
  return keys[Math.floor(Math.random() * keys.length)];
};

const generateEquations = () => {
  let fruit1 = getRandomFruit();
  let fruit2 = getRandomFruit();

  while (fruit1 === fruit2) {
    fruit2 = getRandomFruit();
  }

  let sum1 = fruitValues[fruit1] * 2;
  let sum2 = fruitValues[fruit2] * 2;
  let finalSum = sum1 + sum2;

  return { fruit1, fruit2, sum1, sum2, finalSum };
};

export default function MatchTheEquation() {
  const [equation, setEquation] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [user, setUser] = useState(null);
  const [options, setOptions] = useState([]);
  const [timer, setTimer] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const navigation = useNavigation();
  const timerIntervalRef = useRef(null); // Use ref to store the timer interval

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
    setEquation(generateEquations());

    // Start the timer
    timerIntervalRef.current = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerIntervalRef.current); // Stop the timer when time expires
          setGameOver(true);
          Alert.alert('Time\'s up!', 'You lost the game because time expired!');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerIntervalRef.current); // Clean up timer on unmount or when the game ends
    };
  }, []);

  useEffect(() => {
    if (equation) {
      const correctAnswer = equation.finalSum;
      const incorrectAnswers = [
        correctAnswer + Math.floor(Math.random() * 5) + 1, // Some random wrong answers
        correctAnswer - Math.floor(Math.random() * 5) - 1,
        correctAnswer + Math.floor(Math.random() * 10) - 5,
      ];
      const allAnswers = [correctAnswer, ...incorrectAnswers];
      setOptions(shuffleArray(allAnswers));
    }
  }, [equation]);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const checkAnswer = async (answer) => {
    if (answer === null) {
      Alert.alert('Please select an answer!');
      return;
    }

    const isCorrect = answer === equation.finalSum;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'match_the_equation', user.email);
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
        clearInterval(timerIntervalRef.current); // Stop the timer when the game is won
        navigation.goBack(); // Navigate back to the previous screen after winning
      }
    }

    setEquation(generateEquations());
    setUserAnswer(null); // Reset user answer
  };

  if (!equation || gameOver) return <Text>{gameOver ? 'Game Over!' : 'Loading...'}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match the Equation</Text>

      {/* First Equation */}
      <Text style={styles.equation}>
        {equation.fruit1} + {equation.fruit1} = {equation.sum1}
      </Text>

      {/* Second Equation */}
      <Text style={styles.equation}>
        {equation.fruit2} + {equation.fruit2} = {equation.sum2}
      </Text>

      {/* Mixed Equation */}
      <Text style={styles.equation}>
        {equation.fruit1} + {equation.fruit1} + {equation.fruit2} + {equation.fruit2} = ?
      </Text>

      {/* Timer */}
      <Text style={styles.timer}>Time left: {timer}s</Text>

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

      {/* Submit Answer */}
      <TouchableOpacity style={styles.button} onPress={() => checkAnswer(userAnswer)}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', marginBottom: 50 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  equation: { fontSize: 30, fontWeight: 'bold', marginBottom: 15 },
  timer: { fontSize: 20, marginBottom: 20 },
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
  button: {
    backgroundColor: '#6200ea',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

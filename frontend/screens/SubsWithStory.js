import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateEquation = () => {
  const start = getRandomNumber(10, 30); // Start number (10-30)
  const hidden = getRandomNumber(1, 9);  // Hidden number (1-9)
  const result = start - hidden;

  // Generate 4 options including the correct one
  const options = new Set();
  options.add(hidden);
  while (options.size < 4) {
    options.add(getRandomNumber(1, 9));
  }

  // Shuffle options
  const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

  return { start, hidden, result, options: shuffledOptions };
};

function SubtractionStoryProblem() {
  const [equation, setEquation] = useState(generateEquation());
  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerId, setTimerId] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);

    // Start the timer when the component mounts
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerId(id);

    return () => clearInterval(id); // Cleanup the timer on unmount
  }, []);

  const handleTimeOut = () => {
    Alert.alert('⏳ Times Up!', 'You didnt answer in time. Try again!');
    setEquation(generateEquation());
    setTimeLeft(60);
  };

  const checkAnswer = async (selectedOption) => {
    clearInterval(timerId); // Stop the timer

    const isCorrect = selectedOption === equation.hidden;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'subtraction_story', user.email);
      const userDoc = await getDoc(userRef);
      let newData = { email: user.email, attempts: [] };

      if (userDoc.exists()) {
        newData = userDoc.data();
      }

      newData.attempts.push({ attempt: newData.attempts.length + 1, score });

      await setDoc(userRef, newData);
      Alert.alert(isCorrect ? '✅ Correct!' : '❌ Wrong!', `Your score: ${score}`);

      if (isCorrect) {
        navigation.goBack();
        return;
      }
    }

    setEquation(generateEquation());
    setTimeLeft(60); // Reset the timer for the new equation
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find the Missing Number</Text>
      <Text style={styles.timer}>⏱ Time Left: {timeLeft}s</Text>
      <Text style={styles.equation}>{equation.start} - ? = {equation.result}</Text>

      {/* Multiple-Choice Options */}
      <View style={styles.optionsContainer}>
        {equation.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => checkAnswer(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  timer: { fontSize: 18, color: 'red', marginBottom: 20 },
  equation: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 20 },
  optionButton: { backgroundColor: '#FF5733', padding: 15, borderRadius: 8, margin: 5, minWidth: '40%', alignItems: 'center' },
  optionText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default SubtractionStoryProblem;

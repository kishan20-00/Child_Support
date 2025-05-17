import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const getRandomNumber = () => Math.floor(Math.random() * 10) + 1; // Random number between 1-10

const generateEquation = () => {
  const numbers = Array.from({ length: 4 }, getRandomNumber); // Generate 4 random numbers
  const correctAnswer = numbers.reduce((sum, num) => sum + num, 0); // Calculate their sum

  // Generate multiple-choice options
  const options = new Set();
  options.add(correctAnswer);
  while (options.size < 4) {
    const randomOffset = Math.floor(Math.random() * 10) - 5; // Random offset between -5 and +5
    const distractor = correctAnswer + randomOffset;
    if (distractor !== correctAnswer && distractor > 0) {
      options.add(distractor);
    }
  }

  // Shuffle options
  const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

  return { numbers, correctAnswer, options: shuffledOptions };
};

function AdditionGame() {
  const [numbers, setNumbers] = useState([]);
  const [options, setOptions] = useState([]);
  const correctAnswerRef = useRef(null); // Use ref for consistent access to correctAnswer
  const [user, setUser] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);

    generateNewEquation();
  }, []);

  const generateNewEquation = () => {
    const { numbers, correctAnswer, options } = generateEquation();
    setNumbers(numbers);
    correctAnswerRef.current = correctAnswer; // Update the ref
    setOptions(options);
  };

  const checkAnswer = async (selectedOption) => {
    const selectedNumber = Number(selectedOption); // Ensure selectedOption is treated as a number

    const isCorrect = selectedNumber === correctAnswerRef.current; // Compare with the ref value
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'addition_game', user.email);
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
      }
    }

    // Generate a new equation after processing the current one
    generateNewEquation();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solve the Addition Problem</Text>
      <Text style={styles.equation}>
        {numbers.join(' + ')} = ?
      </Text>

      {/* Multiple-choice options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
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
  equation: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 20 },
  optionButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, margin: 5, minWidth: '40%', alignItems: 'center' },
  optionText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AdditionGame;

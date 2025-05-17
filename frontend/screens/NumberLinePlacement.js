import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

// Function to generate a new number line problem with options
const generateProblem = () => {
  const start = Math.floor(Math.random() * 20) + 1; // Start number (1-20)
  const addNumber = Math.floor(Math.random() * 20) + 1; // Hidden number (1-20)
  const sum = start + addNumber; // Sum shown to user

  // Generate 4 options including the correct one
  const options = new Set();
  options.add(addNumber);
  while (options.size < 4) {
    options.add(Math.floor(Math.random() * 20) + 1);
  }

  // Shuffle options
  const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);

  return { start, sum, addNumber, options: shuffledOptions };
};

export default function NumberLineGame() {
  const [problem, setProblem] = useState(generateProblem());
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  const checkAnswer = async (selectedOption) => {
    const isCorrect = selectedOption === problem.addNumber;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'number_line_game', user.email);
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
      } else {
        setProblem(generateProblem()); // Generate new problem
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find the Missing Number</Text>
      <Text style={styles.instruction}>🔢 The sum is: {problem.sum}</Text>
      <Text style={styles.instruction}>🟢 First number: {problem.start}</Text>
      
      {/* Number Line Display */}
      <View style={styles.numberLine}>
        <Text style={styles.number}>{problem.start}</Text>
        <Text style={styles.plus}>+</Text>
        <Text style={styles.questionMark}>?</Text>
        <Text style={styles.equals}>=</Text>
        <Text style={styles.number}>{problem.sum}</Text>
      </View>

      {/* Multiple-Choice Options */}
      <View style={styles.optionsContainer}>
        {problem.options.map((option, index) => (
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

// 🎨 Styles
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  instruction: { fontSize: 18, marginBottom: 10 },
  numberLine: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  number: { fontSize: 28, fontWeight: 'bold', marginHorizontal: 10 },
  plus: { fontSize: 28, fontWeight: 'bold', color: 'blue' },
  equals: { fontSize: 28, fontWeight: 'bold', color: 'green', marginHorizontal: 10 },
  questionMark: { fontSize: 28, fontWeight: 'bold', color: 'red', marginHorizontal: 10 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 20 },
  optionButton: { backgroundColor: '#2196F3', padding: 15, borderRadius: 8, margin: 5, minWidth: '40%', alignItems: 'center' },
  optionText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

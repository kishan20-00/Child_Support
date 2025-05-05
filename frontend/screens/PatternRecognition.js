import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const patterns = [
  { sequence: [2, 4, 6, 8], answer: 10 },  // +2 Pattern
  { sequence: [3, 6, 9, 12], answer: 15 }, // +3 Pattern
  { sequence: [1, 4, 9, 16], answer: 25 }, // Squares
  { sequence: [5, 10, 20, 40], answer: 80 }, // Multiply by 2
  { sequence: [2, 3, 5, 8], answer: 13 },  // Fibonacci-like
];

const getRandomPattern = () => patterns[Math.floor(Math.random() * patterns.length)];

export default function PatternRecognitionGame() {
  const [currentPattern, setCurrentPattern] = useState(getRandomPattern());
  const [userInput, setUserInput] = useState('');
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  const checkAnswer = async () => {
    const userAnswer = parseInt(userInput, 10);
    const isCorrect = userAnswer === currentPattern.answer;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'pattern_recognition_game', user.email);
      const userDoc = await getDoc(userRef);
      let newData = { email: user.email, attempts: [] };

      if (userDoc.exists()) {
        newData = userDoc.data();
      }

      newData.attempts.push({ attempt: newData.attempts.length + 1, score });

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
    setCurrentPattern(getRandomPattern());
    setUserInput('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find the Missing Number!</Text>
      <Text style={styles.sequence}>
        {currentPattern.sequence.join(', ')} , ?
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter missing number"
        value={userInput}
        onChangeText={setUserInput}
      />
      <TouchableOpacity style={styles.button} onPress={checkAnswer}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  sequence: { fontSize: 24, marginVertical: 10, fontWeight: 'bold' },
  input: { width: '50%', height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, textAlign: 'center', fontSize: 20, borderRadius: 5 },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});

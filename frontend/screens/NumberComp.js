import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

// Function to generate a number pattern with one incorrect number
const generatePattern = () => {
  const patterns = [
    { type: 'Arithmetic', sequence: (n) => 2 + 3 * n }, // 2, 5, 8, 11, 14...
    { type: 'Multiplication', sequence: (n) => 2 ** n }, // 2, 4, 8, 16...
    { type: 'Fibonacci', sequence: (n, a = 1, b = 1) => (n < 2 ? 1 : a + b) }, // 1, 1, 2, 3, 5...
  ];

  // Select a random pattern type
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  const sequence = [];
  let a = 1,
    b = 1;

  // Generate a valid pattern of 6 numbers
  for (let i = 0; i < 6; i++) {
    sequence.push(selectedPattern.sequence(i, a, b));
    if (selectedPattern.type === 'Fibonacci') {
      [a, b] = [b, a + b];
    }
  }

  // Introduce one incorrect number randomly
  const wrongIndex = Math.floor(Math.random() * 6);
  const incorrectNumber = sequence[wrongIndex] + Math.floor(Math.random() * 5) + 1;
  const displayedSequence = [...sequence];
  displayedSequence[wrongIndex] = incorrectNumber;

  return { displayedSequence, correctIndex: wrongIndex };
};

const NumberPatternGame = () => {
  const [pattern, setPattern] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [user, setUser] = useState(null);
  const navigation = useNavigation(); // Initialize navigation hook

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
    const { displayedSequence, correctIndex } = generatePattern();
    setPattern(displayedSequence);
    setCorrectIndex(correctIndex);
  }, []);

  // Handle user selection
  const handleSelection = async (index) => {
    if (index === correctIndex) {
      await saveScore(true); // Correct answer, save score as 1
      Alert.alert('Correct!', 'You found the wrong number.', [
        { text: 'OK', onPress: () => navigateToHome() },
      ]);
    } else {
      await saveScore(false); // Incorrect answer, save score as 0
      Alert.alert('Wrong!', 'Try again.');
    }
  };

  // Save score to Firebase
  const saveScore = async (isCorrect) => {
    const score = isCorrect ? 1 : 0;
    const userEmail = user?.email;
    if (userEmail) {
      const userRef = doc(db, 'number_comparison', userEmail);
      const userDoc = await getDoc(userRef);

      let newData = { email: userEmail, attempts: [] };
      if (userDoc.exists()) {
        newData = userDoc.data();
      }
      newData.attempts.push({ attempt: newData.attempts.length + 1, score });

      try {
        await setDoc(userRef, newData);
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  };

  // Reset game with a new pattern
  const resetGame = () => {
    const { displayedSequence, correctIndex } = generatePattern();
    setPattern(displayedSequence);
    setCorrectIndex(correctIndex);
  };

  // Navigate to Home screen
  const navigateToHome = () => {
    navigation.navigate('Dyscalculia'); // Adjust with your Home screen name
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find the incorrect number!</Text>
      <View style={styles.sequenceContainer}>
        {pattern.map((num, index) => (
          <TouchableOpacity
            key={index}
            style={styles.numberButton}
            onPress={() => handleSelection(index)}
          >
            <Text style={styles.numberText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sequenceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  numberButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    margin: 5,
    borderRadius: 5,
  },
  numberText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default NumberPatternGame;

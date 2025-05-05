import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateOptions = () => {
  let num1 = getRandomNumber(1, 10);
  let num2 = getRandomNumber(1, 10);
  let sum = num1 + num2;

  let incorrect1 = [getRandomNumber(1, 10), getRandomNumber(1, 10)];
  while (incorrect1[0] + incorrect1[1] === sum) {
    incorrect1 = [getRandomNumber(1, 10), getRandomNumber(1, 10)];
  }

  let incorrect2 = [getRandomNumber(1, 10), getRandomNumber(1, 10)];
  while (
    incorrect2[0] + incorrect2[1] === sum ||
    (incorrect2[0] === incorrect1[0] && incorrect2[1] === incorrect1[1])
  ) {
    incorrect2 = [getRandomNumber(1, 10), getRandomNumber(1, 10)];
  }

  let options = [
    { numbers: [num1, num2], correct: true },
    { numbers: incorrect1, correct: false },
    { numbers: incorrect2, correct: false },
  ];

  options.sort(() => Math.random() - 0.5); // Shuffle options

  return { sum, options };
};

export default function MakeNumberGame() {
  const [gameData, setGameData] = useState(null);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
    setGameData(generateOptions());
  }, []);

  const checkAnswer = async (selectedOption) => {
    if (!gameData) return;

    const isCorrect = selectedOption.correct;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'make_number_game', user.email);
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
      }
    }

    setGameData(generateOptions());
  };

  if (!gameData) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Make a Number by Adding 2 Numbers</Text>
      <Text style={styles.sumText}>Target Sum: {gameData.sum}</Text>

      {gameData.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.optionButton}
          onPress={() => checkAnswer(option)}
        >
          <Text style={styles.optionText}>{option.numbers[0]} + {option.numbers[1]}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  sumText: { fontSize: 26, fontWeight: 'bold', marginBottom: 15 },
  optionButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, marginVertical: 10, width: '60%', alignItems: 'center' },
  optionText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});

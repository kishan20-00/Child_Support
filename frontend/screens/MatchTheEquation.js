import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
  const [userAnswer, setUserAnswer] = useState('');
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
    setEquation(generateEquations());
  }, []);

  const checkAnswer = async () => {
    if (!userAnswer || !equation) {
      Alert.alert('Please enter an answer!');
      return;
    }

    const isCorrect = parseInt(userAnswer) === equation.finalSum;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'match_the_equation', user.email);
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

    setEquation(generateEquations());
    setUserAnswer('');
  };

  if (!equation) return <Text>Loading...</Text>;

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

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter the sum"
        value={userAnswer}
        onChangeText={setUserAnswer}
      />
      <TouchableOpacity style={styles.button} onPress={checkAnswer}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', marginBottom: 50, },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  equation: { fontSize: 30, fontWeight: 'bold', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, width: '50%', textAlign: 'center', fontSize: 18, marginBottom: 20 },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

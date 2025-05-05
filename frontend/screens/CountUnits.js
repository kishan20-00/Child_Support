import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

// Object & Unit Mapping
const measurementPairs = [
  { object: '✏️', unit: '🟫', count: 5 },  // Pencil = 5 Matchsticks
  { object: '📏', unit: '🟦', count: 10 }, // Ruler = 10 Small Blocks
  { object: '🛶', unit: '🪵', count: 8 },  // Canoe = 8 Logs
  { object: '🦯', unit: '🪵', count: 6 },  // Walking Stick = 6 Wooden Sticks
  { object: '🏗️', unit: '🧱', count: 12 } // Crane Beam = 12 Bricks
];

export default function MeasureObjectsGame() {
  const [currentPair, setCurrentPair] = useState(measurementPairs[Math.floor(Math.random() * measurementPairs.length)]);
  const [userInput, setUserInput] = useState('');
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  const checkAnswer = async () => {
    const userAnswer = parseInt(userInput, 10);
    const isCorrect = userAnswer === currentPair.count;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'measure_objects_game', user.email);
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
    setCurrentPair(measurementPairs[Math.floor(Math.random() * measurementPairs.length)]);
    setUserInput('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How Many {currentPair.unit} Fit This {currentPair.object}?</Text>
      <Text style={styles.object}>{currentPair.object}</Text>
      <Text style={styles.units}>{currentPair.unit.repeat(currentPair.count)}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter count"
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
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', marginBottom: 120 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  object: { fontSize: 80, marginBottom: 20 },
  units: { fontSize: 40, marginBottom: 20, textAlign: 'center' },
  input: { width: '50%', height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, textAlign: 'center', fontSize: 20, borderRadius: 5 },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});

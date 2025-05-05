import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

// Animal leg count mapping
const animals = [
  { emoji: '🐶', legs: 4 },  // Dog
  { emoji: '🐱', legs: 4 },  // Cat
  { emoji: '🐎', legs: 4 },  // Horse
  { emoji: '🦆', legs: 2 },  // Duck
  { emoji: '🐔', legs: 2 },  // Chicken
  { emoji: '🦎', legs: 4 },  // Lizard
  { emoji: '🦀', legs: 10 }, // Crab
  { emoji: '🦜', legs: 2 },  // Parrot
  { emoji: '🕷️', legs: 8 }   // Spider
];

export default function CountLegsGame() {
  const [currentAnimal, setCurrentAnimal] = useState(animals[Math.floor(Math.random() * animals.length)]);
  const [userInput, setUserInput] = useState('');
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  const checkAnswer = async () => {
    const userAnswer = parseInt(userInput, 10);
    const isCorrect = userAnswer === currentAnimal.legs;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'count_legs_game', user.email);
      const userDoc = await getDoc(userRef);
      let newData = { email: user.email, attempts: [] };

      if (userDoc.exists()) {
        newData = userDoc.data();
      }

      newData.attempts.push({ attempt: newData.attempts.length + 1, score });

      await setDoc(userRef, newData);
      Alert.alert(isCorrect ? 'Correct!' : 'Wrong!', `Your score: ${score}`);

      if (isCorrect) {
        navigation.navigate('Main');
      } else {
        resetGame();
      }
    }
  };

  const resetGame = () => {
    setCurrentAnimal(animals[Math.floor(Math.random() * animals.length)]);
    setUserInput('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How Many Legs Does This Animal Have?</Text>
      <Text style={styles.emoji}>{currentAnimal.emoji}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter number of legs"
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
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', marginBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  emoji: { fontSize: 100, marginBottom: 20 }, // Large emoji for visibility
  input: { width: '50%', height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, textAlign: 'center', fontSize: 20, borderRadius: 5 },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});

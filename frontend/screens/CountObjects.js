import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const objects = ['🍎', '🍊', '🍌']; // Different fruit emojis

const getRandomObject = () => objects[Math.floor(Math.random() * objects.length)];
const getRandomCount = () => Math.floor(Math.random() * 9) + 2; // Random count between 2 and 10

export default function CountObjectsGame() {
  const [emoji, setEmoji] = useState(getRandomObject());
  const [count, setCount] = useState(getRandomCount());
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const timerRef = useRef(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  useFocusEffect(
    useCallback(() => {
      startTimer();

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current); // Stop the timer when navigating away
        }
      };
    }, [])
  );

  const startTimer = () => {
    setTimeLeft(60);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          Alert.alert('Time’s up!', 'Try again.');
          resetGame();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const checkAnswer = async () => {
    const userAnswer = parseInt(userInput, 10);
    const isCorrect = userAnswer === count;
    const score = isCorrect ? 1 : 0;

    if (timerRef.current) clearInterval(timerRef.current); // Stop timer when user answers

    if (user) {
      const userRef = doc(db, 'count_objects_game', user.email);
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
    setEmoji(getRandomObject());
    setCount(getRandomCount());
    setUserInput('');
    startTimer();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Count the Objects Under the Tree!</Text>
      <Text style={styles.tree}>🌳</Text>
      <Text style={styles.objects}>{emoji.repeat(count)}</Text>
      <Text style={styles.timer}>⏳ {timeLeft}s left</Text>
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
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  tree: { fontSize: 80 },
  objects: { fontSize: 40, marginVertical: 10 },
  timer: { fontSize: 18, color: 'red', marginBottom: 20 },
  input: { width: '50%', height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, textAlign: 'center', fontSize: 20, borderRadius: 5 },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});

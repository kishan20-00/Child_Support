import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const patterns = [
  ['🍉', '🍇', '🍒', '🥥'], // Example pattern
  ['🐶', '🐱', '🐭', '🐹'], // Animals
  ['⭐', '🌙', '☀️', '🌈'], // Sky-related
  ['🎵', '🎤', '🎸', '🥁'], // Music-related
  ['🍌', '🍉', '🍒', '🍓'], // Fruits
];

const getRandomPattern = () => {
  const basePattern = patterns[Math.floor(Math.random() * patterns.length)];
  const repeatingPattern = [...basePattern, ...basePattern]; // Repeat the pattern twice
  const blankIndex = Math.floor(Math.random() * repeatingPattern.length);
  const correctAnswer = repeatingPattern[blankIndex];

  // Replace the blankIndex with a placeholder
  repeatingPattern[blankIndex] = '_';

  // Generate multiple-choice options
  const options = new Set([correctAnswer]);
  while (options.size < 4) {
    const randomEmoji = patterns.flat()[Math.floor(Math.random() * patterns.flat().length)];
    if (!options.has(randomEmoji)) {
      options.add(randomEmoji);
    }
  }

  return {
    pattern: repeatingPattern,
    blankIndex,
    correctAnswer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
};

export default function EmojiPatternGame() {
  const [gameData, setGameData] = useState(getRandomPattern());
  const [user, setUser] = useState(null);
  const [timer, setTimer] = useState(60);
  const timerRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);

    // Start the timer countdown
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current);
          handleGameLoss();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => {
      // Cleanup the timer when navigating away
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const checkAnswer = async (selectedOption) => {
    const isCorrect = selectedOption === gameData.correctAnswer;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'emoji_pattern_game', user.email);
      const userDoc = await getDoc(userRef);
      let newData = { email: user.email, attempts: [] };

      if (userDoc.exists()) {
        newData = userDoc.data();
      }

      newData.attempts.push({ attempt: newData.attempts.length + 1, score });

      await setDoc(userRef, newData);
      Alert.alert(isCorrect ? 'Correct!' : 'Wrong!', `Your score: ${score}`);

      if (isCorrect) {
        clearInterval(timerRef.current); // Stop the timer if the game is won
        navigation.goBack();
      } else {
        resetGame();
      }
    }
  };

  const resetGame = () => {
    setGameData(getRandomPattern());
    setTimer(60); // Reset the timer to 60 seconds
  };

  const handleGameLoss = () => {
    Alert.alert('Time Up!', 'You didn\'t answer in time. Game over.');
    resetGame();
  };

  const { pattern, options } = gameData;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete the Emoji Pattern!</Text>
      <Text style={styles.timer}>Time Remaining: {timer}s</Text>
      <Text style={styles.sequence}>
        {pattern.join(' ')}
      </Text>
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
  timer: { fontSize: 18, marginBottom: 20, color: 'red', fontWeight: 'bold' },
  sequence: { fontSize: 24, marginVertical: 10, fontWeight: 'bold' },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 20 },
  optionButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, margin: 5, minWidth: '40%', alignItems: 'center' },
  optionText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

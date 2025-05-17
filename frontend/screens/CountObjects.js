import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const objects = ['🍎', '🍊', '🍌'];

const getRandomObject = () => objects[Math.floor(Math.random() * objects.length)];
const getRandomCount = () => Math.floor(Math.random() * 9) + 2; // 2–10

const generateOptions = (correctAnswer) => {
  const opts = new Set([correctAnswer]);
  while (opts.size < 4) {
    const rnd = Math.floor(Math.random() * 9) + 2;
    if (rnd !== correctAnswer) opts.add(rnd);
  }
  return Array.from(opts).sort(() => Math.random() - 0.5);
};

const generateGame = () => {
  const emoji = getRandomObject();
  const count = getRandomCount();
  return {
    emoji,
    count,
    options: generateOptions(count),
  };
};

export default function CountObjectsGame() {
  const [gameData, setGameData] = useState(generateGame);
  const [timeLeft, setTimeLeft] = useState(60);
  const [user, setUser] = useState(null);
  const timerRef = useRef(null);
  const navigation = useNavigation();
  const { emoji, count, options } = gameData;

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  useFocusEffect(useCallback(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []));

  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(60);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
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

  const checkAnswer = async (selected) => {
    clearInterval(timerRef.current);
    const isCorrect = selected === count;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'count_objects_game', user.email);
      const userDoc = await getDoc(userRef);
      const newData = userDoc.exists() 
        ? userDoc.data() 
        : { email: user.email, attempts: [] };

      newData.attempts.push({ attempt: newData.attempts.length + 1, score });
      await setDoc(userRef, newData);
    }

    Alert.alert(isCorrect ? '✅ Correct!' : '❌ Wrong!', `The right answer was ${count}.`);
    if (isCorrect) {
      navigation.goBack();
    } else {
      resetGame();
    }
  };

  const resetGame = () => {
    setGameData(generateGame());
    startTimer();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Count the Objects Under the Tree!</Text>
      <Text style={styles.tree}>🌳</Text>
      <Text style={styles.objects}>{emoji.repeat(count)}</Text>
      <Text style={styles.timer}>⏳ {timeLeft}s left</Text>

      <View style={styles.optionsContainer}>
        {options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={styles.optionButton}
            onPress={() => checkAnswer(opt)}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#f5f5f5', marginBottom:120 },
  title:      { fontSize:22, fontWeight:'bold', marginBottom:20 },
  tree:       { fontSize:80 },
  objects:    { fontSize:40, marginVertical:10 },
  timer:      { fontSize:18, color:'red', marginBottom:20 },
  optionsContainer: { flexDirection:'row', flexWrap:'wrap', justifyContent:'center', marginVertical:20 },
  optionButton:     { backgroundColor:'#007BFF', padding:15, borderRadius:8, margin:5, minWidth:'40%', alignItems:'center' },
  optionText:       { color:'#fff', fontSize:18, fontWeight:'bold' },
});

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

// Define emoji mapping for numbers (1-9)
const numberToEmoji = {
  1: '🍏', 2: '🍎', 3: '🍌', 4: '🍇', 5: '🍉',
  6: '🥑', 7: '🥕', 8: '🍒', 9: '🥭'
};

// Generate random problem
const generateProblem = () => {
  const num1 = Math.floor(Math.random() * 9) + 1; // Random number 1-9
  const num2 = Math.floor(Math.random() * 9) + 1; // Random number 1-9
  const sum = num1 + num2; // Correct answer
  return { num1, num2, sum };
};

export default function NumberMatchingGame() {
  const [problem, setProblem] = useState(generateProblem());
  const [userInput, setUserInput] = useState('');
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  const checkAnswer = async () => {
    const isCorrect = parseInt(userInput) === problem.sum;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'number_matching_game', user.email);
      const userDoc = await getDoc(userRef);
      let newData = { email: user.email, attempts: [] };

      if (userDoc.exists()) {
        newData = userDoc.data();
      }

      newData.attempts.push({ attempt: newData.attempts.length + 1, score });

      await setDoc(userRef, newData);
      Alert.alert(isCorrect ? '✅ Correct!' : '❌ Wrong!', `Your score: ${score}`);

      if (isCorrect) {
        navigation.navigate('Dyscalculia');
      } else {
        setProblem(generateProblem()); // Generate new problem
        setUserInput('');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find the Correct Sum</Text>
      <Text style={styles.instruction}>🔢 Add the emoji numbers</Text>

      {/* Emoji Display for Numbers with Values */}
      <View style={styles.emojiContainer}>
        <View style={styles.emojiBox}>
          <Text style={styles.emoji}>{numberToEmoji[problem.num1]}</Text>
          <Text style={styles.numberText}>{problem.num1}</Text>
        </View>
        <Text style={styles.plus}>+</Text>
        <View style={styles.emojiBox}>
          <Text style={styles.emoji}>{numberToEmoji[problem.num2]}</Text>
          <Text style={styles.numberText}>{problem.num2}</Text>
        </View>
        <Text style={styles.equals}>=</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={userInput}
          onChangeText={setUserInput}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={checkAnswer}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  instruction: { fontSize: 18, marginBottom: 10 },
  emojiContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  emojiBox: { alignItems: 'center', marginHorizontal: 10 },
  emoji: { fontSize: 50 },
  numberText: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 5 },
  plus: { fontSize: 30, fontWeight: 'bold', color: 'blue' },
  equals: { fontSize: 30, fontWeight: 'bold', color: 'green', marginHorizontal: 10 },
  input: { borderBottomWidth: 2, borderBottomColor: 'black', width: 60, fontSize: 28, textAlign: 'center' },
  button: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, marginTop: 20, width: '60%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});


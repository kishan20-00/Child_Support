import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

// Function to generate a new number line problem
const generateProblem = () => {
  const start = Math.floor(Math.random() * 20) + 1; // Start number (1-20)
  const addNumber = Math.floor(Math.random() * 20) + 1; // Hidden number (1-20)
  const sum = start + addNumber; // Sum shown to user
  return { start, sum, addNumber };
};

export default function NumberLineGame() {
  const [problem, setProblem] = useState(generateProblem());
  const [userInput, setUserInput] = useState('');
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  const checkAnswer = async () => {
    const isCorrect = parseInt(userInput) === problem.addNumber;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'number_line_game', user.email);
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
      <Text style={styles.title}>Find the Missing Number</Text>
      <Text style={styles.instruction}>🔢 The sum is: {problem.sum}</Text>
      <Text style={styles.instruction}>🟢 First number: {problem.start}</Text>
      
      {/* Number Line Display */}
      <View style={styles.numberLine}>
        <Text style={styles.number}>{problem.start}</Text>
        <Text style={styles.plus}>+</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={userInput}
          onChangeText={setUserInput}
        />
        <Text style={styles.equals}>=</Text>
        <Text style={styles.number}>{problem.sum}</Text>
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
  numberLine: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  number: { fontSize: 28, fontWeight: 'bold', marginHorizontal: 10 },
  plus: { fontSize: 28, fontWeight: 'bold', color: 'blue' },
  equals: { fontSize: 28, fontWeight: 'bold', color: 'green', marginHorizontal: 10 },
  input: { borderBottomWidth: 2, borderBottomColor: 'black', width: 60, fontSize: 28, textAlign: 'center' },
  button: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, marginTop: 20, width: '60%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});


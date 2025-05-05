import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const getRandomStart = () => Math.floor(Math.random() * 10) + 1; // Start between 1-10
const getRandomStep = () => Math.floor(Math.random() * 5) + 1; // Step between 1-5

const generatePattern = () => {
  const start = getRandomStart();
  const step = getRandomStep();
  const pattern = [start, start + step, start + 2 * step, start + 3 * step];
  const answer = start + 4 * step;
  return { pattern, answer };
};

function AdditionWithCounters() {
  const [sequence, setSequence] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [user, setUser] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
    const { pattern, answer } = generatePattern();
    setSequence(pattern);
    setCorrectAnswer(answer);
  }, []);

  const checkAnswer = async () => {
    if (!userAnswer) {
      Alert.alert('Please enter an answer!');
      return;
    }

    const isCorrect = parseInt(userAnswer) === correctAnswer;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'addition_counters', user.email);
      const userDoc = await getDoc(userRef);
      let newData = { email: user.email, attempts: [] };

      if (userDoc.exists()) {
        newData = userDoc.data();
      }

      newData.attempts.push({ attempt: newData.attempts.length + 1, score });

      await setDoc(userRef, newData);
      Alert.alert(isCorrect ? 'Correct!' : 'Wrong!', `Your score: ${score}`);

      // Navigate to Home if correct
      if (isCorrect) {
        navigation.navigate('Dyscalculia');
      }
    }

    // Generate a new pattern
    const { pattern, answer } = generatePattern();
    setSequence(pattern);
    setCorrectAnswer(answer);
    setUserAnswer('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete the Number Pattern</Text>
      <View style={styles.sequenceContainer}>
        {sequence.map((num, index) => (
          <Text key={index} style={styles.number}>{num}</Text>
        ))}
        <Text style={styles.questionMark}>?</Text>
      </View>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter the last number"
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
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  sequenceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  number: { fontSize: 24, fontWeight: 'bold', marginHorizontal: 10 },
  questionMark: { fontSize: 24, fontWeight: 'bold', color: 'red', marginHorizontal: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, width: '50%', textAlign: 'center', fontSize: 18, marginBottom: 20 },
  button: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AdditionWithCounters;

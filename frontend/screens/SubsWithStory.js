import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateEquation = () => {
  const start = getRandomNumber(10, 30); // Start number (10-30)
  const hidden = getRandomNumber(1, 9);  // Hidden number (1-9)
  const result = start - hidden;
  return { start, hidden, result };
};

function SubtractionStoryProblem() {
  const [equation, setEquation] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  const [user, setUser] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
    setEquation(generateEquation());
  }, []);

  const checkAnswer = async () => {
    if (!userAnswer) {
      Alert.alert('Please enter an answer!');
      return;
    }

    const isCorrect = parseInt(userAnswer) === equation.hidden;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'subtraction_story', user.email);
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

    // Generate a new equation
    setEquation(generateEquation());
    setUserAnswer('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find the Missing Number</Text>
      <Text style={styles.equation}>{equation.start} - ? = {equation.result}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter the missing number"
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
  equation: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, width: '50%', textAlign: 'center', fontSize: 18, marginBottom: 20 },
  button: { backgroundColor: '#FF5733', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default SubtractionStoryProblem;

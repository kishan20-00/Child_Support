import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { auth, db } from '../firebaseConfig'; 
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';  // Import the navigation hook

const getRandomNumber = () => Math.floor(Math.random() * 11) + 5; // 5-15 dots

const generateOptions = (correct) => {
  let options = new Set();
  options.add(correct);
  while (options.size < 3) {
    let randomOption = correct + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
    if (randomOption > 0) options.add(randomOption);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
};

export default function DotCountingGame() {
  const [dotCount, setDotCount] = useState(getRandomNumber());
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [user, setUser] = useState(null);
  
  const navigation = useNavigation();  // Hook for navigation

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
    setOptions(generateOptions(dotCount));
  }, [dotCount]);

  const checkAnswer = async () => {
    if (selectedAnswer === null) {
      Alert.alert('Select an answer!');
      return;
    }

    const isCorrect = selectedAnswer == dotCount;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'dot_counting', user.email);
      const userDoc = await getDoc(userRef);

      let newData = { email: user.email, attempts: [] };
      if (userDoc.exists()) {
        newData = userDoc.data();
      }
      newData.attempts.push({ attempt: newData.attempts.length + 1, score });

      await setDoc(userRef, newData);
      Alert.alert(isCorrect ? 'Correct!' : 'Wrong!', `Your score: ${score}`);
      
      // Navigate to Home screen if the answer is correct
      if (isCorrect) {
        navigation.navigate('Dyscalculia');  // Adjust with your Home screen name
      }
    }

    setDotCount(getRandomNumber());
    setOptions(generateOptions(dotCount));
    setSelectedAnswer(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dot Counting Game</Text>
      <View style={styles.dotContainer}>
        {Array.from({ length: dotCount }).map((_, index) => (
          <Text key={index} style={styles.dot}>⚫</Text>
        ))}
      </View>
      <RadioButton.Group onValueChange={(value) => setSelectedAnswer(value)} value={selectedAnswer}>
        {options.map((option, index) => (
          <View key={index} style={styles.radioButtonContainer}>
            <RadioButton value={option} />
            <Text>{option}</Text>
          </View>
        ))}
      </RadioButton.Group>
      <TouchableOpacity style={styles.button} onPress={checkAnswer}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  dotContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  dot: { fontSize: 40, margin: 5 },
  radioButtonContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  button: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

// Function to generate random bends
const generateBendPath = () => {
  const bendOptions = [
    { path: "M10 30 Q 50 5, 90 30 Q 130 55, 170 30", bends: 2 },
    { path: "M10 30 Q 40 5, 70 30 Q 100 55, 130 30 Q 160 5, 190 30", bends: 3 },
    { path: "M10 50 Q 50 10, 90 50 Q 130 90, 170 50 Q 210 10, 250 50", bends: 4 }
  ];
  return bendOptions[Math.floor(Math.random() * bendOptions.length)];
};

export default function FindBendsGame() {
  const [currentBend, setCurrentBend] = useState(generateBendPath());
  const [userInput, setUserInput] = useState('');
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  const checkAnswer = async () => {
    const userAnswer = parseInt(userInput, 10);
    const isCorrect = userAnswer === currentBend.bends;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'find_bends_game', user.email);
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
    setCurrentBend(generateBendPath());
    setUserInput('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Count the Bends in the String!</Text>
      <Svg height="80" width="250" viewBox="0 0 250 80">
        <Path d={currentBend.path} stroke="black" strokeWidth="3" fill="none" />
      </Svg>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter number of bends"
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
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '50%', height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, textAlign: 'center', fontSize: 20, borderRadius: 5 },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});

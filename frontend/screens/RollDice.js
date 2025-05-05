import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const rollDice = () => Math.floor(Math.random() * 6) + 1;

const diceDots = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅',
};

export default function RollDiceGame() {
  const [dice1, setDice1] = useState(rollDice());
  const [dice2, setDice2] = useState(rollDice());
  const [userInput, setUserInput] = useState('');
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  const checkAnswer = async () => {
    const sum = dice1 + dice2;
    const userAnswer = parseInt(userInput, 10);
    const isCorrect = userAnswer === sum;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'roll_dice_game', user.email);
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
      }
    }

    setDice1(rollDice());
    setDice2(rollDice());
    setUserInput('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Roll 2 Dice and Add the Values</Text>
      <View style={styles.diceContainer}>
        <Text style={styles.dice}>{diceDots[dice1]}</Text>
        <Text style={styles.dice}>{diceDots[dice2]}</Text>
      </View>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter sum"
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
  diceContainer: { flexDirection: 'row', marginBottom: 20 },
  dice: { fontSize: 50, marginHorizontal: 20 },
  input: { width: '50%', height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, textAlign: 'center', fontSize: 20, borderRadius: 5 },
  button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});

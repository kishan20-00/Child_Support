import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

// Coin denominations
const COINS = [1, 2, 5, 10];

// Generate random coins
const generateRandomCoins = () => {
  const coins = [];
  for (let i = 0; i < 4; i++) {
    coins.push(COINS[Math.floor(Math.random() * COINS.length)]);
  }
  return coins;
};

// Sum coins
const calculateTotal = (coins) => coins.reduce((sum, c) => sum + c, 0);

// Generate options for multiple choice
const generateOptions = (correct) => {
  const opts = new Set([correct]);
  while (opts.size < 4) {
    const offset = Math.floor(Math.random() * 11) - 5; // -5 to +5
    const val = correct + offset;
    if (val > 0 && val !== correct) opts.add(val);
  }
  return Array.from(opts).sort(() => Math.random() - 0.5);
};

const MoneyGame = () => {
  const navigation = useNavigation();
  const [coins, setCoins] = useState(generateRandomCoins());
  const [total, setTotal] = useState(calculateTotal(coins));
  const [options, setOptions] = useState(generateOptions(total));
  const [user, setUser] = useState(null);
  const [timer, setTimer] = useState(60); // Set initial time to 60 seconds
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);

    let interval;
    if (timer > 0 && !gameOver) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timer === 0) {
      handleGameLoss();
    }

    return () => clearInterval(interval); // Clean up interval when component unmounts or game is over
  }, [timer, gameOver]);

  // Reset the round with new coins and options
  const resetRound = () => {
    const newCoins = generateRandomCoins();
    const newTotal = calculateTotal(newCoins);
    setCoins(newCoins);
    setTotal(newTotal);
    setOptions(generateOptions(newTotal));
    setGameOver(false);
    setTimer(60); // Reset timer to 60 seconds
  };

  // Handle user selecting an answer
  const checkAnswer = async (selected) => {
    const isCorrect = selected === total;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, "money_game", user.email);
      const userDoc = await getDoc(userRef);
      let data = { email: user.email, attempts: [] };
      if (userDoc.exists()) data = userDoc.data();
      data.attempts.push({ attempt: data.attempts.length + 1, score, timestamp: new Date() });
      await setDoc(userRef, data);
    }

    if (isCorrect) {
      Alert.alert("✅ Correct!", `The total was ${total}`);
      setGameOver(true);
      navigation.goBack(); // Navigate to the next screen
    } else {
      Alert.alert("❌ Wrong!", `The total was ${total}`);
      resetRound(); // Reset round with new coins
    }
  };

  // Handle game loss when time runs out
  const handleGameLoss = () => {
    setGameOver(true);
    Alert.alert("❌ Time's up!", "You ran out of time.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Money in the Box</Text>
      <Text style={styles.question}>Select the total amount of money inside the box:</Text>
      <View style={styles.box}>
        {coins.map((c, i) => (
          <Text key={i} style={styles.coinEmoji}>
            🪙 {c}
          </Text>
        ))}
      </View>
      <View style={styles.optionsContainer}>
        {options.map((opt, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.optionButton}
            onPress={() => checkAnswer(opt)}
            disabled={gameOver} // Disable options after game is over
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.timer}>Time left: {timer}s</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  question: { fontSize: 18, marginBottom: 20 },
  box: {
    width: '80%',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  coinEmoji: { fontSize: 30, margin: 5 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  optionButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, margin: 5, minWidth: '40%', alignItems: 'center' },
  optionText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  timer: { fontSize: 20, marginTop: 20, fontWeight: 'bold' },
});

export default MoneyGame;

import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { auth, db } from "../firebaseConfig"; // Import auth and db
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

// Coin denominations
const COINS = [1, 2, 5, 10];

// Function to generate a random combination of coins
const generateRandomCoins = () => {
  const coins = [];
  for (let i = 0; i < 4; i++) {
    const randomCoin = COINS[Math.floor(Math.random() * COINS.length)];
    coins.push(randomCoin);
  }
  return coins;
};

// Function to calculate the total amount of money in the box
const calculateTotal = (coins) => coins.reduce((sum, coin) => sum + coin, 0);

const MoneyGame = () => {
  const navigation = useNavigation();
  const [coins, setCoins] = useState(generateRandomCoins());
  const [total, setTotal] = useState(calculateTotal(coins));
  const [userInput, setUserInput] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  const handleSubmit = async () => {
    const userAnswer = parseInt(userInput, 10);
    if (isNaN(userAnswer)) {
      Alert.alert("Invalid Input", "Please enter a valid number.");
      return;
    }

    const isCorrect = userAnswer === total;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, "money_game", user.email);
      const userDoc = await getDoc(userRef);

      let newData = { email: user.email, attempts: [] };
      if (userDoc.exists()) {
        newData = userDoc.data();
      }
      newData.attempts.push({
        attempt: newData.attempts.length + 1,
        score,
        timestamp: new Date(),
      });

      await setDoc(userRef, newData);
      Alert.alert(isCorrect ? "Correct!" : "Wrong!", `Your score: ${score}`);
    }

    // Move to the next round
    setTimeout(() => {
      const newCoins = generateRandomCoins();
      setCoins(newCoins);
      setTotal(calculateTotal(newCoins));
      setUserInput("");
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Money Game</Text>
      <Text style={styles.questionText}>How much money is in the box?</Text>
      <View style={styles.coinContainer}>
        {coins.map((coin, index) => (
          <Text key={index} style={styles.coinEmoji}>🪙 {coin}</Text>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Enter the total amount"
        keyboardType="numeric"
        value={userInput}
        onChangeText={(text) => setUserInput(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  questionText: { fontSize: 18, marginBottom: 20 },
  coinContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginBottom: 20 },
  coinEmoji: { fontSize: 30, margin: 5 },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 18,
  },
  button: {
    backgroundColor: "#6200ea",
    padding: 15,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default MoneyGame;
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { auth, db } from "../firebaseConfig"; // Import auth and db
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

// Function to generate a random number of apples (between 1 and 10)
const getRandomAppleCount = () => Math.floor(Math.random() * 10) + 1;

// Function to generate options for the user to choose from
const generateOptions = (correctCount) => {
  let options = new Set();
  options.add(correctCount);
  while (options.size < 4) {
    let randomOption = correctCount + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
    if (randomOption > 0) options.add(randomOption);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
};

const CountApplesGame = () => {
  const navigation = useNavigation();
  const [appleCount, setAppleCount] = useState(getRandomAppleCount());
  const [options, setOptions] = useState(generateOptions(appleCount));
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [user, setUser] = useState(null);
  const [timer, setTimer] = useState(60);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
    setOptions(generateOptions(appleCount));
  }, [appleCount]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev > 0) return prev - 1;
        clearInterval(countdown);
        if (!isNavigatingAway) handleGameLoss();
        return 0;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isNavigatingAway]);

  const handleGameLoss = async () => {
    if (user) {
      const userRef = doc(db, "count_apples", user.email);
      const userDoc = await getDoc(userRef);

      let newData = { email: user.email, attempts: [] };
      if (userDoc.exists()) {
        newData = userDoc.data();
      }
      newData.attempts.push({
        attempt: newData.attempts.length + 1,
        score: 0,
        timestamp: new Date(),
      });

      await setDoc(userRef, newData);
    }
    Alert.alert("Time's up!", "You lost the game.");
    resetGame();
  };

  const handleAnswer = async (option) => {
    setSelectedAnswer(option);

    const isCorrect = option === appleCount;
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, "count_apples", user.email);
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

    if (isCorrect) {
      navigation.goBack();
    } else {
      setTimeout(() => resetGame(), 1000);
    }
  };

  const resetGame = () => {
    setAppleCount(getRandomAppleCount());
    setOptions(generateOptions(appleCount));
    setSelectedAnswer(null);
    setTimer(60);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setIsNavigatingAway(true); // Prevent further actions when navigating away
      setTimer(0); // Stops the timer
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Count the Apples</Text>
      <Text style={styles.timer}>Time Left: {timer} seconds</Text>
      <View style={styles.appleContainer}>
        {Array.from({ length: appleCount }).map((_, index) => (
          <Text key={index} style={styles.appleEmoji}>🍎</Text>
        ))}
      </View>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer === option
                ? option === appleCount
                  ? styles.correctAnswer
                  : styles.wrongAnswer
                : null,
            ]}
            onPress={() => handleAnswer(option)}
            disabled={selectedAnswer !== null}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  timer: { fontSize: 18, marginBottom: 20, color: "red" },
  appleContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginBottom: 20 },
  appleEmoji: { fontSize: 40, margin: 5 },
  optionsContainer: { width: "100%", alignItems: "center" },
  optionButton: {
    width: "80%",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#6200ea",
  },
  optionText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  correctAnswer: { backgroundColor: "green" },
  wrongAnswer: { backgroundColor: "red" },
});

export default CountApplesGame;
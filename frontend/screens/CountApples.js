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

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
    setOptions(generateOptions(appleCount));
  }, [appleCount]);

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

    // Move to the next round
    setTimeout(() => {
      setAppleCount(getRandomAppleCount());
      setOptions(generateOptions(appleCount));
      setSelectedAnswer(null);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Count the Apples</Text>
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
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
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
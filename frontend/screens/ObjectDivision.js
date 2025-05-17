import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const questions = [
  {
    question: "If 4 🍌 bananas were divided among 2 people, how much will one person get?",
    answer: 2,
    options: [1, 2, 3, 4],
  },
  {
    question: "If 6 🍎 apples were divided among 3 people, how much will one person get?",
    answer: 2,
    options: [2, 3, 1, 4],
  },
  {
    question: "If 8 🍕 pizzas were divided among 4 people, how much will one person get?",
    answer: 2,
    options: [1, 2, 3, 4],
  },
  {
    question: "If 5 🥕 carrots were divided among 5 people, how much will one person get?",
    answer: 1,
    options: [1, 2, 3, 5],
  },
];

const ObjectDivisionGame = () => {
  const navigation = useNavigation();
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null); // "won" or "lost" or "timeout"
  const [timeLeft, setTimeLeft] = useState(60); // 60-second timer
  const [timerActive, setTimerActive] = useState(true);

  // Reset timer when screen is focused/unfocused
  useFocusEffect(
    React.useCallback(() => {
      setTimerActive(true);
      return () => {
        setTimerActive(false);
        setTimeLeft(60); // Reset timer on exit
      };
    }, [])
  );

  // Timer countdown logic
  useEffect(() => {
    if (!timerActive || gameOver) return;

    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        clearInterval(timer);
        handleTimeOut();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerActive, gameOver]);

  // Pick a random question on mount
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
    
    const randomIndex = Math.floor(Math.random() * questions.length);
    setRandomQuestion(questions[randomIndex]);
  }, []);

  const handleTimeOut = async () => {
    setGameOver(true);
    setResult("timeout");
    setTimerActive(false);

    if (user) {
      await saveResult(false); // Save loss due to timeout
    }

    Alert.alert(
      "Time's Up!",
      "You didn't answer in time. Game Over!",
      [{ text: "OK", onPress: () => navigation.navigate("Dyscalculia") }]
    );
  };

  const saveResult = async (isCorrect) => {
    const userRef = doc(db, "object_division", user.email);
    const userDoc = await getDoc(userRef);

    let newData = { email: user.email, attempts: [] };
    if (userDoc.exists()) {
      newData = userDoc.data();
    }
    newData.attempts.push({
      attempt: newData.attempts.length + 1,
      score: isCorrect ? 1 : 0,
      timestamp: new Date(),
      result: isCorrect ? "won" : "lost",
      timeLeft: timeLeft, // Store remaining time
    });

    await setDoc(userRef, newData);
  };

  const handleAnswer = async (option) => {
    const correct = option === randomQuestion.answer;
    setSelectedOption(option);
    setTimerActive(false); // Stop timer after answering

    if (correct) {
      setResult("won");
    } else {
      setResult("lost");
    }

    setTimeout(async () => {
      setGameOver(true);
      if (user) await saveResult(correct);

      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>⏳ Time Left: {timeLeft}s</Text>
      
      {!gameOver && randomQuestion ? (
        <>
          <Text style={styles.questionText}>{randomQuestion.question}</Text>
          <View style={styles.optionsContainer}>
            {randomQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === option
                    ? option === randomQuestion.answer
                      ? styles.correctAnswer
                      : styles.wrongAnswer
                    : null,
                ]}
                onPress={() => handleAnswer(option)}
                disabled={selectedOption !== null}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          {result === "won" ? (
            <>
              <Text style={styles.finalScoreText}>🎉 You Won! 🎉</Text>
              <Text style={styles.winText}>Score: 1/1 (Time Left: {timeLeft}s)</Text>
            </>
          ) : result === "lost" ? (
            <>
              <Text style={styles.finalScoreText}>❌ You Lost! ❌</Text>
              <Text style={styles.loseText}>Score: 0/1</Text>
            </>
          ) : (
            <Text style={styles.loseText}>⏰ Time's Up!</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  timerText: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#6200ea" },
  questionText: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
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
  gameOverContainer: { alignItems: "center" },
  gameOverText: { fontSize: 24, fontWeight: "bold", color: "red" },
  finalScoreText: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  winText: { fontSize: 22, fontWeight: "bold", color: "green" },
  loseText: { fontSize: 22, fontWeight: "bold", color: "orange" },
});

export default ObjectDivisionGame;
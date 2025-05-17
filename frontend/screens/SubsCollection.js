import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const questionTypes = [
  { type: "26 - 11 = __", answer: 15, options: [9, 18, 15, 11] },
  { type: "25 - __ = 15", answer: 10, options: [13, 10, 15, 14] },
  { type: "10 + __ = 7", answer: 3, options: [3, 15, 2, 9] },
  { type: "22 - 10 = __", answer: 12, options: [22, 14, 20, 12] },
  { type: "12 - 7 = __", answer: 5, options: [1, 4, 5, 7] },
];

const SubsctractionGame = () => {
  const navigation = useNavigation();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [remainingQuestions, setRemainingQuestions] = useState([...questionTypes]);
  const [questionsShown, setQuestionsShown] = useState(0);
  const [maxQuestions, setMaxQuestions] = useState(2);
  const [timer, setTimer] = useState(60);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    } else {
      console.log("No user authenticated!");
    }
    generateQuestion();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timer <= 0 && !gameCompleted) {
      handleGameEnd(false);
    }
  }, [timer]);

  useFocusEffect(
    React.useCallback(() => {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : prev));
      }, 1000);
      return () => clearInterval(interval);
    }, [])
  );

  const generateQuestion = () => {
    if (remainingQuestions.length === 0 || questionsShown >= maxQuestions) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    setCurrentQuestion(remainingQuestions[randomIndex]);
    setRemainingQuestions((prev) => prev.filter((_, index) => index !== randomIndex));
    setQuestionsShown((prev) => prev + 1);
    setSelectedOption(null); // Reset selection for new question
  };

  const handleAnswer = async (option) => {
    if (selectedOption !== null || gameCompleted) return; // Prevent multiple selections
    
    const correct = option === currentQuestion.answer;
    setSelectedOption(option);

    if (correct) {
      const newScore = score + 1;
      setScore(newScore);

      if (newScore === maxQuestions) {
        handleGameEnd(true);
      } else {
        Alert.alert("Correct!", "Well done!", [
          { text: "OK", onPress: () => generateQuestion() },
        ]);
      }
    } else {
      Alert.alert("Wrong!", "Try again!");
    }
  };

  const handleGameEnd = async (won) => {
    setGameCompleted(true);
    clearInterval(timer);
    
    const message = won ? "You won! Congratulations!" : "Time's up! You have lost the game.";
    Alert.alert(won ? "Victory!" : "Game Over", message, [
      {
        text: "OK",
        onPress: async () => {
          await saveResult(won);
          navigation.goBack();
        },
      },
    ]);
  };

  const saveResult = async (won) => {
    if (!user) {
      console.log("User not found, cannot save result!");
      return;
    }

    const userRef = doc(db, "substraction_collection", user.email);

    try {
      const userDoc = await getDoc(userRef);
      const attempts = userDoc.exists() ? userDoc.data().attempts || [] : [];
      
      const newAttempt = {
        attempt: attempts.length + 1,
        score: score,
        won,
        maxQuestions: maxQuestions,
        completionTime: 60 - timer // Time taken to complete
      };

      await setDoc(userRef, {
        email: user.email,
        attempts: [...attempts, newAttempt],
      }, { merge: true });

      console.log("Game result saved successfully!");
    } catch (error) {
      console.error("Error saving game result:", error);
    }
  };

  return (
    <View style={styles.container}>
      {currentQuestion && (
        <>
          <Text style={styles.timerText}>Time Left: {timer}s</Text>
          <Text style={styles.questionText}>{currentQuestion.type}</Text>
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === option
                    ? option === currentQuestion.answer
                      ? styles.correctAnswer
                      : styles.wrongAnswer
                    : null,
                ]}
                onPress={() => handleAnswer(option)}
                disabled={selectedOption !== null || gameCompleted}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.scoreText}>Score: {score}/{maxQuestions}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  timerText: { fontSize: 18, color: "red", fontWeight: "bold", marginBottom: 20 },
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
  scoreText: { fontSize: 18, marginTop: 20 },
});

export default SubsctractionGame;

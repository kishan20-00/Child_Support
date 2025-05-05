import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig"; // Import auth and db
import { collection, doc, getDoc, setDoc } from "firebase/firestore";

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, []);

  const handleAnswer = async (option) => {
    const correct = option === questions[currentQuestionIndex].answer;
    setSelectedOption(option);

    if (correct) {
      setScore(score + 1);
    }

    setTimeout(async () => {
      setSelectedOption(null);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Game Over
        setGameOver(true);

        // Save result in Firebase under the user's email
        if (user) {
          const userRef = doc(db, "object_division", user.email);
          const userDoc = await getDoc(userRef);

          let newData = { email: user.email, attempts: [] };
          if (userDoc.exists()) {
            newData = userDoc.data();
          }
          newData.attempts.push({
            attempt: newData.attempts.length + 1,
            score: score + (correct ? 1 : 0), // Final Score
            timestamp: new Date(),
          });

          await setDoc(userRef, newData);
        }

        setTimeout(() => {
          navigation.navigate("Dyscalculia"); // Navigate back to Home after 2 seconds
        }, 2000);
      }
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {!gameOver ? (
        <>
          <Text style={styles.questionText}>{questions[currentQuestionIndex].question}</Text>
          <View style={styles.optionsContainer}>
            {questions[currentQuestionIndex].options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === option
                    ? option === questions[currentQuestionIndex].answer
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
          <Text style={styles.scoreText}>Score: {score}</Text>
        </>
      ) : (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>Game Over!</Text>
          <Text style={styles.finalScoreText}>Final Score: {score}/{questions.length}</Text>
          {score === questions.length ? (
            <Text style={styles.winText}>🎉 You Won! 🎉</Text>
          ) : (
            <Text style={styles.loseText}>Better Luck Next Time! 😃</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
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
  gameOverContainer: { alignItems: "center" },
  gameOverText: { fontSize: 24, fontWeight: "bold", color: "red" },
  finalScoreText: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  winText: { fontSize: 22, fontWeight: "bold", color: "green" },
  loseText: { fontSize: 22, fontWeight: "bold", color: "orange" },
});

export default ObjectDivisionGame;
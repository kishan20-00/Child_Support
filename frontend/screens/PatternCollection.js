import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const questionTypes = [
  {
    id: 1,
    type: "What should be the 5th and 6th numbers in this pattern?",
    pattern: "2,4,6,8,__,__",
    answerType: "sequence",
    correctAnswer: [10, 12],
    options: [
      [9, 11],
      [10, 12],
      [8, 10],
      [10, 14]
    ],
    explanation: "The pattern increases by 2 each time (2, 4, 6, 8, 10, 12)"
  },
  {
    id: 2,
    type: "What should be the 4th number in this pattern?",
    pattern: "15,20,25,__,35,40",
    answerType: "single",
    correctAnswer: 30,
    options: [28, 30, 32, 27],
    explanation: "The pattern increases by 5 each time (15, 20, 25, 30, 35, 40)"
  },
  {
    id: 3,
    type: "Which number does not fit this pattern?",
    pattern: "6,10,13,18,22",
    answerType: "single",
    correctAnswer: 13,
    options: [6, 10, 13, 18, 22],
    explanation: "The pattern should increase by 4,5,4,5 (6+4=10, 10+5=15 but shows 13)"
  },
  {
    id: 4,
    type: "Which shape fits the blank in this pattern?",
    pattern: "📐 ⚪ ⬜ ⭐ __ ⚪ ⬜ ⭐",
    answerType: "single",
    correctAnswer: "📐",
    options: ["📐", "⚪", "⬜", "⭐"],
    explanation: "The pattern repeats: 📐 ⚪ ⬜ ⭐"
  },
  {
    id: 5,
    type: "Which shape fits the blank in this pattern?",
    pattern: "⬆ ⬇ ↙ ↖ ⬆ ⬇ ↙",
    answerType: "single",
    correctAnswer: "↖",
    options: ["⬆", "⬇", "↙", "↖"],
    explanation: "The pattern repeats: ⬆ ⬇ ↙ ↖"
  }
];

const PatternCollection = () => {
  const navigation = useNavigation();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);
  const [timer, setTimer] = useState(60);
  const timerRef = useRef(null);
  const [gameStatus, setGameStatus] = useState("playing"); // 'playing', 'won', 'lost'

  // Get a random question
  const getRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questionTypes.length);
    return questionTypes[randomIndex];
  };

  // Start the timer
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current);
          handleGameEnd(false);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  // Stop the timer
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }

    // Initialize game with a random question
    setCurrentQuestion(getRandomQuestion());
    startTimer();

    // Clean up timer on unmount
    return () => stopTimer();
  }, []);

  const handleAnswer = (option) => {
    if (selectedOption !== null || gameStatus !== "playing") return;
    
    setSelectedOption(option);
    const isCorrect = JSON.stringify(option) === JSON.stringify(currentQuestion.correctAnswer);

    if (isCorrect) {
      setScore(1);
      stopTimer();
      setGameStatus("won");
      Alert.alert("Correct!", currentQuestion.explanation, [
        { text: "OK", onPress: () => handleGameEnd(true) }
      ]);
      navigation.goBack();
    } else {
      Alert.alert("Incorrect!", `The correct answer was: ${formatAnswer(currentQuestion)}\n\n${currentQuestion.explanation}`, [
        { text: "OK", onPress: () => handleGameEnd(false) }
      ]);
    }
  };

  const formatAnswer = (question) => {
    if (question.answerType === "sequence") {
      return question.correctAnswer.join(", ");
    } else {
      return question.correctAnswer;
    }
  };

  const handleGameEnd = async (won) => {
    stopTimer();
    setGameStatus(won ? "won" : "lost");
    await saveResult(won);
  };

  const saveResult = async (won) => {
    if (!user.email) {
      console.log("User not found, cannot save result!");
      return;
    }

    const userRef = doc(db, "Pattern_collection", user.email);

    try {
      const userDoc = await getDoc(userRef);
      const attempts = userDoc.exists() ? userDoc.data().attempts || [] : [];
      
      const newAttempt = {
        attemptId: Date.now(),
        questionId: currentQuestion.id,
        score: won ? 1 : 0,
        timeLeft: timer,
        won: won
      };

      await setDoc(userRef, {
        email: user.email,
        attempts: [...attempts, newAttempt],
        lastPlayed: new Date().toISOString()
      }, { merge: true });

      console.log("Game result saved successfully!");
    } catch (error) {
      console.error("Error saving game result:", error);
    }
  };

  // Handle navigation away from the game
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // If user navigates away without answering
        if (gameStatus === "playing") {
          stopTimer();
          saveResult(false); // Save as lost if they didn't complete
        }
      };
    }, [gameStatus])
  );

  const renderOptions = () => {
    if (currentQuestion.answerType === "sequence") {
      return currentQuestion.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            selectedOption && JSON.stringify(selectedOption) === JSON.stringify(option)
              ? JSON.stringify(option) === JSON.stringify(currentQuestion.correctAnswer)
                ? styles.correctAnswer
                : styles.wrongAnswer
              : null,
          ]}
          onPress={() => handleAnswer(option)}
          disabled={selectedOption !== null || gameStatus !== "playing"}
        >
          <Text style={styles.optionText}>{option.join(", ")}</Text>
        </TouchableOpacity>
      ));
    } else {
      return currentQuestion.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            selectedOption === option
              ? option === currentQuestion.correctAnswer
                ? styles.correctAnswer
                : styles.wrongAnswer
              : null,
          ]}
          onPress={() => handleAnswer(option)}
          disabled={selectedOption !== null || gameStatus !== "playing"}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ));
    }
  };

  return (
    <View style={styles.container}>
      {currentQuestion && (
        <>
          <Text style={styles.timerText}>Time Left: {timer}s</Text>
          <Text style={styles.questionText}>{currentQuestion.type}</Text>
          <Text style={styles.patternText}>{currentQuestion.pattern}</Text>
          
          <View style={styles.optionsContainer}>
            {renderOptions()}
          </View>
          
          <Text style={styles.scoreText}>Score: {score}/1</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5"
  },
  timerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF5252",
    marginBottom: 20
  },
  questionText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333"
  },
  patternText: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 30,
    color: "#6200ea",
    fontWeight: "bold"
  },
  optionsContainer: {
    width: "100%",
    alignItems: "center"
  },
  optionButton: {
    width: "90%",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#6200ea",
    elevation: 3
  },
  optionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },
  correctAnswer: {
    backgroundColor: "#4CAF50"
  },
  wrongAnswer: {
    backgroundColor: "#F44336"
  },
  scoreText: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
    color: "#333"
  }
});

export default PatternCollection;
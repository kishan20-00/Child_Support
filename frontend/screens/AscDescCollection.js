import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const questionTypes = [
  {
    id: 1,
    type: "What is the answer when these numbers are arranged in ascending order?",
    numbers: [20, 25, 16, 12, 8],
    order: "ascending",
    answerType: "full",
    correctAnswer: [8, 12, 16, 20, 25],
    options: [
      [8, 12, 16, 20, 25],
      [25, 20, 16, 12, 8],
      [12, 8, 16, 20, 25],
      [20, 25, 16, 12, 8]
    ]
  },
  {
    id: 2,
    type: "What is the 3rd number when these numbers are arranged in ascending order?",
    numbers: [29, 18, 20, 9, 13],
    order: "ascending",
    answerType: "position",
    position: 3,
    correctAnswer: 20,
    options: [18, 20, 13, 9]
  },
  {
    id: 3,
    type: "What is the 4th number when these numbers are arranged in ascending order?",
    numbers: [13, 7, 8, 9, 17],
    order: "ascending",
    answerType: "position",
    position: 4,
    correctAnswer: 13,
    options: [9, 13, 17, 8]
  },
  {
    id: 4,
    type: "What is the answer when these numbers are arranged in descending order?",
    numbers: [10, 20, 7, 12, 15],
    order: "descending",
    answerType: "full",
    correctAnswer: [20, 15, 12, 10, 7],
    options: [
      [20, 15, 12, 10, 7],
      [7, 10, 12, 15, 20],
      [10, 12, 15, 20, 7],
      [15, 20, 12, 10, 7]
    ]
  },
  {
    id: 5,
    type: "What is the 3rd number when these numbers are arranged in descending order?",
    numbers: [30, 8, 20, 40, 10],
    order: "descending",
    answerType: "position",
    position: 3,
    correctAnswer: 20,
    options: [20, 10, 30, 8]
  },
  {
    id: 6,
    type: "What is the 4th number when these numbers are arranged in descending order?",
    numbers: [12, 5, 14, 20, 7],
    order: "descending",
    answerType: "position",
    position: 4,
    correctAnswer: 7,
    options: [7, 5, 12, 14]
  }
];

const AscDescCollection = () => {
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
    const correct = JSON.stringify(option) === JSON.stringify(currentQuestion.correctAnswer);

    if (correct) {
      setScore(1); // Only one question per attempt, so score is either 0 or 1
      stopTimer();
      setGameStatus("won");
      Alert.alert("Correct!", "You answered correctly!", [
        { text: "OK", onPress: () => handleGameEnd(true) }
      ]);
    } else {
      Alert.alert("Wrong!", `The correct answer was: ${formatAnswer(currentQuestion)}`, [
        { text: "OK", onPress: () => handleGameEnd(false) }
      ]);
    }
  };

  const formatAnswer = (question) => {
    if (question.answerType === "full") {
      return question.correctAnswer.join(", ");
    } else {
      return question.correctAnswer;
    }
  };

  const handleGameEnd = async (won) => {
    stopTimer();
    setGameStatus(won ? "won" : "lost");
    await saveResult(won);
    navigation.goBack();
  };

  const saveResult = async (won) => {
    if (!user.email) {
      console.log("User not found, cannot save result!");
      return;
    }

    const userRef = doc(db, "asc_desc_collection", user.email);

    try {
      const userDoc = await getDoc(userRef);
      const attempts = userDoc.exists() ? userDoc.data().attempts || [] : [];
      
      const newAttempt = {
        attemptId: Date.now(),
        questionId: currentQuestion.id,
        score: won ? 1 : 0,
        timeLeft: timer,
        timestamp: new Date().toISOString(),
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
    if (currentQuestion.answerType === "full") {
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
          <Text style={styles.numbersText}>{currentQuestion.numbers.join(", ")}</Text>
          
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
    color: timer => timer < 10 ? "red" : "#333",
    marginBottom: 20
  },
  questionText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333"
  },
  numbersText: {
    fontSize: 18,
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
    fontSize: 16,
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

export default AscDescCollection;
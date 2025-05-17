import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

import Image1 from "../assets/Length1.png";
import Image2 from "../assets/Length2.png";
import Image3 from "../assets/Length3.png";
import Image4 from "../assets/Length4.png";
import Image5 from "../assets/Length5.png";

const questionTypes = [
  {
    id: 1,
    type: "How many matchsticks shorter is the nail here than the pencil?",
    image: Image1,
    answerType: "number",
    correctAnswer: 3,
    options: [2, 3, 4, 5],
    explanation: "The pencil is 6 matchsticks long, the nail is 3 matchsticks long, difference is 3"
  },
  {
    id: 2,
    type: "How many matchsticks is the distance from the child to the house than the distance from the child to the tree?",
    image: Image2,
    answerType: "number",
    correctAnswer: 2,
    options: [1, 2, 3, 4],
    explanation: "Child to house: 5 matchsticks, child to tree: 3 matchsticks, difference is 2"
  },
  {
    id: 3,
    type: "How many nails is the length of brush A less than that of brush B?",
    image: Image3,
    answerType: "number",
    correctAnswer: 3,
    options: [2, 3, 4, 5],
    explanation: "Brush A: 4 nails long, Brush B: 7 nails long, difference is 3"
  },
  {
    id: 4,
    type: "How many more matchsticks are the distance between trees A and B than the distance between trees C and D?",
    image: Image4,
    answerType: "number",
    correctAnswer: 4,
    options: [3, 4, 5, 6],
    explanation: "A-B: 8 matchsticks, C-D: 4 matchsticks, difference is 4"
  },
  {
    id: 5,
    type: "Who is the third tallest child?",
    image: Image5,
    answerType: "letter",
    correctAnswer: "A",
    options: ["A", "B", "C", "D"],
    explanation: "Heights from tallest to shortest: C, B, A, D"
  }
];

const LengthCollection = () => {
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
    const isCorrect = option === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(1);
      stopTimer();
      setGameStatus("won");
      Alert.alert("Correct!", currentQuestion.explanation, [
        { text: "OK", onPress: () => handleGameEnd(true) }
      ]);
      navigation.goBack();
    } else {
      Alert.alert("Incorrect!", `The correct answer was: ${currentQuestion.correctAnswer}\n\n${currentQuestion.explanation}`, [
        { text: "OK", onPress: () => handleGameEnd(false) }
      ]);
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

    const userRef = doc(db, "Length_collection", user.email);

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
  };

  return (
    <View style={styles.container}>
      {currentQuestion && (
        <>
          <Text style={styles.timerText}>Time Left: {timer}s</Text>
          <Text style={styles.questionText}>{currentQuestion.type}</Text>
          
          <View style={styles.imageContainer}>
            <Image 
              source={currentQuestion.image} 
              style={styles.questionImage}
              resizeMode="contain"
            />
          </View>
          
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
    marginBottom: 15
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333"
  },
  imageContainer: {
    width: "100%",
    height: 200,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 3
  },
  questionImage: {
    width: "100%",
    height: "100%"
  },
  optionsContainer: {
    width: "100%",
    alignItems: "center"
  },
  optionButton: {
    width: "80%",
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

export default LengthCollection;
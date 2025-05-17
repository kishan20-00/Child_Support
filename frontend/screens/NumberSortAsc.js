import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

// Function to generate random numbers for sorting
const generateRandomNumbers = () => {
  const numbers = [];
  for (let i = 0; i < 5; i++) {
    numbers.push(Math.floor(Math.random() * 100) + 1); // Numbers between 1 and 100
  }
  return numbers;
};

const NumberSortingGame = () => {
  const [numbers, setNumbers] = useState([]);
  const [sortedNumbers, setSortedNumbers] = useState([]);
  const [userAnswer, setUserAnswer] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedNumbers, setSelectedNumbers] = useState([]); // To display clicked numbers
  const [timer, setTimer] = useState(60); // Timer state
  const timerIntervalRef = useRef(null); // Ref to store the timer interval
  const navigation = useNavigation(); // Navigation hook for screen transitions

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
    const randomNumbers = generateRandomNumbers();
    setNumbers(randomNumbers);
    setSortedNumbers([...randomNumbers].sort((a, b) => a - b)); // Sort numbers

    // Start the timer
    timerIntervalRef.current = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerIntervalRef.current); // Stop the timer when time expires
          handleGameLost();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerIntervalRef.current); // Clean up timer on unmount or when the game ends
    };
  }, []);

  const handleOptionPress = (number) => {
    if (selectedNumbers.includes(number)) return; // Prevent adding the same number twice
    setUserAnswer((prev) => [...prev, number]);
    setSelectedNumbers((prev) => [...prev, number]); // Add clicked number to the display list
  };

  const handleSubmit = async () => {
    if (userAnswer.length !== numbers.length) {
      Alert.alert('Please select all numbers!');
      return;
    }

    const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(sortedNumbers);
    const score = isCorrect ? 1 : 0;

    if (user) {
      const userRef = doc(db, 'number_sorting', user.email);
      const userDoc = await getDoc(userRef);

      let newData = { email: user.email, attempts: [] };
      if (userDoc.exists()) {
        newData = userDoc.data();
      }
      newData.attempts.push({ attempt: newData.attempts.length + 1, score });

      await setDoc(userRef, newData);
      Alert.alert(isCorrect ? 'Correct!' : 'Wrong!', `Your score: ${score}`);

      if (isCorrect) {
        clearInterval(timerIntervalRef.current); // Stop the timer when the game is won
        navigation.goBack(); // Adjust the screen name to your Home page
      }
    }

    // Reset the game
    const randomNumbers = generateRandomNumbers();
    setNumbers(randomNumbers);
    setSortedNumbers([...randomNumbers].sort((a, b) => a - b));
    setUserAnswer([]);
    setSelectedNumbers([]); // Clear selected numbers display
  };

  const handleGameLost = () => {
    setTimer(0);
    Alert.alert('Times up!', 'You lost the game because time expired!');
    const randomNumbers = generateRandomNumbers();
    setNumbers(randomNumbers);
    setSortedNumbers([...randomNumbers].sort((a, b) => a - b));
    setUserAnswer([]);
    setSelectedNumbers([]);
  };

  useEffect(() => {
    return () => {
      clearInterval(timerIntervalRef.current); // Ensure timer stops if the user navigates away
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sort the Numbers!</Text>
      <Text style={styles.timer}>Time left: {timer}s</Text>
      <View style={styles.numberContainer}>
        {numbers.map((num, index) => (
          <TouchableOpacity
            key={index}
            style={styles.numberButton}
            onPress={() => handleOptionPress(num)}
          >
            <Text style={styles.numberText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.instruction}>Click on the numbers in the correct order!</Text>

      {/* Display selected numbers below */}
      <Text style={styles.selectedNumbersText}>Selected Numbers: {selectedNumbers.join(', ')}</Text>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#d32f2f',
  },
  numberContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  numberButton: {
    backgroundColor: '#e0e0e0',
    padding: 20,
    margin: 5,
    borderRadius: 5,
  },
  numberText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  instruction: {
    fontSize: 18,
    marginBottom: 20,
  },
  selectedNumbersText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NumberSortingGame;
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const getRandomNumber = () => Math.floor(Math.random() * 11) + 5; // Random numbers between 5-15

const generateRandomNumbers = () => {
  const numbers = [];
  for (let i = 0; i < 5; i++) {
    numbers.push(getRandomNumber());
  }
  return numbers;
};

const SortNumbersDescendingGame = () => {
  const [numbers, setNumbers] = useState([]);
  const [sortedNumbers, setSortedNumbers] = useState([]);
  const [userAnswer, setUserAnswer] = useState([]);
  const [user, setUser] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timer, setTimer] = useState(60);

  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);

    const randomNumbers = generateRandomNumbers();
    setNumbers(randomNumbers);
    setSortedNumbers([...randomNumbers].sort((a, b) => b - a));

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTimeout = () => {
    Alert.alert('Time Up!', 'You ran out of time. Try again.');
    resetGame();
  };

  const handleClick = (num) => {
    if (userAnswer.length < 5) {
      setUserAnswer((prev) => [...prev, num]);
    }
  };

  const handleSubmit = async () => {
    if (userAnswer.length !== 5) {
      Alert.alert('Incomplete!', 'Please select all numbers before submitting!');
      return;
    }

    const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(sortedNumbers);
    if (isCorrect) {
      Alert.alert('Correct!', 'You sorted the numbers correctly!');
    } else {
      Alert.alert('Wrong!', 'Your sorting is incorrect.');
    }

    clearInterval(timer); // Stop the timer

    if (user) {
      const userRef = doc(db, 'number_sorting_desc', user.email);
      const userDoc = await getDoc(userRef);
      let newData = { email: user.email, attempts: [] };
      if (userDoc.exists()) {
        newData = userDoc.data();
      }

      newData.attempts.push({ attempt: newData.attempts.length + 1, score: isCorrect ? 1 : 0 });
      await setDoc(userRef, newData);
    }

    if (isCorrect) {
      navigation.goBack();
    }

    resetGame();
  };

  const resetGame = () => {
    const randomNumbers = generateRandomNumbers();
    setNumbers(randomNumbers);
    setSortedNumbers([...randomNumbers].sort((a, b) => b - a));
    setUserAnswer([]);
    setIsSubmitted(false);
    setTimer(60);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sort the numbers in Descending Order!</Text>
      <Text style={styles.timerText}>Time Left: {timer} seconds</Text>

      <View style={styles.numbersContainer}>
        {numbers.map((num, index) => (
          <TouchableOpacity
            key={index}
            style={styles.numberButton}
            onPress={() => handleClick(num)}
            disabled={isSubmitted}
          >
            <Text style={styles.numberText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {userAnswer.length > 0 && !isSubmitted && (
        <View style={styles.selectedNumbersContainer}>
          <Text>Selected Numbers:</Text>
          <Text style={styles.selectedNumbersText}>{userAnswer.join(', ')}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitted}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      {isSubmitted && (
        <View style={styles.resultContainer}>
          <Text>{`Correct Order: ${sortedNumbers.join(', ')}`}</Text>
        </View>
      )}
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
    marginBottom: 10,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 20,
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  numberButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    margin: 5,
    borderRadius: 5,
  },
  numberText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectedNumbersContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedNumbersText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
  },
});

export default SortNumbersDescendingGame;
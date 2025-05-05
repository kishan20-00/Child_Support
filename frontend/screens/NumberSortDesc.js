import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';  // Importing useNavigation hook for navigation

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
  const [user, setUser] = useState(null);
  const [userAnswer, setUserAnswer] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigation = useNavigation();  // Hook for navigation to home page

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
    const randomNumbers = generateRandomNumbers();
    setNumbers(randomNumbers);
    setSortedNumbers([...randomNumbers].sort((a, b) => b - a)); // Sort numbers in descending order
  }, []);

  const handleClick = (num) => {
    if (userAnswer.length < 5) {
      setUserAnswer((prev) => [...prev, num]);
    }
  };

  const handleSubmit = async () => {
    if (userAnswer.length !== 5) {
      Alert.alert('Please select all numbers before submitting!');
      return;
    }

    const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(sortedNumbers);

    // Saving to database
    if (user) {
      const userRef = doc(db, 'number_sorting_desc', user.email);
      const userDoc = await getDoc(userRef);
      let newData = { email: user.email, attempts: [] };
      if (userDoc.exists()) {
        newData = userDoc.data();
      }

      newData.attempts.push({ attempt: newData.attempts.length + 1, score: isCorrect ? 1 : 0 });

      await setDoc(userRef, newData);
      Alert.alert(isCorrect ? 'Correct!' : 'Wrong!', `Your score: ${isCorrect ? 1 : 0}`);

      setIsSubmitted(true);

      // Navigate to home screen if the answer is correct
      if (isCorrect) {
        navigation.navigate('Dyscalculia');  // Adjust with your Home screen name
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sort the numbers in Descending Order!</Text>
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

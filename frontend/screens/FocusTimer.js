import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const emojis = ['🍎', '🌳', '🚩', '🐶', '🍕', '🎈', '🚗', '📚', '⚽', '🍦'];

const FocusTimerGame = () => {
  const [age, setAge] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [displaySequence, setDisplaySequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true); // New state to handle first load

  useEffect(() => {
    const fetchAge = async () => {
      const user = auth.currentUser;
      if (user) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          setAge(userDoc.data().age);
          console.log('Fetched Age:', userDoc.data().age); // Debugging
        } else {
          Alert.alert('Error', 'User profile not found.');
        }
      }
    };

    fetchAge();
  }, []);

  const startGame = () => {
    if (!age) {
      Alert.alert('Error', 'Age not found in profile.');
      return;
    }

    setIsFirstLoad(false); // Mark that the game has started at least once

    // Convert age to a number (if it's a string)
    const userAge = Number(age);

    // Set numEmojis based on age
    const numEmojis = userAge === 8 ? 4 : 7; // 4 emojis if age is 8, else 7
    console.log(`Age: ${userAge}, numEmojis: ${numEmojis}`); // Debugging

    const randomSequence = [];
    for (let i = 0; i < numEmojis; i++) {
      const randomIndex = Math.floor(Math.random() * emojis.length);
      randomSequence.push(emojis[randomIndex]);
    }
    setSequence(randomSequence);
    setDisplaySequence([]);
    setUserSequence([]);
    setScore(0);
    setGameStarted(true);
    setGameOver(false);

    let index = 0;
    const interval = setInterval(() => {
      if (index < randomSequence.length) {
        setDisplaySequence((prev) => [...prev, randomSequence[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setGameOver(true);
          setDisplaySequence([]);
        }, 3000);
      }
    }, 3000);
  };

  const handleEmojiTap = (emoji) => {
    if (userSequence.length < sequence.length) {
      setUserSequence((prev) => [...prev, emoji]);
    }
  };

  useEffect(() => {
    if (userSequence.length === sequence.length) {
      const correctEmojis = new Set(sequence);
      const userEmojis = new Set(userSequence);
      const matchedEmojis = [...userEmojis].filter((emoji) => correctEmojis.has(emoji)).length;

      setScore(matchedEmojis);
      saveScore(matchedEmojis);
    }
  }, [userSequence]);

  const saveScore = async (correctCount) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await addDoc(collection(db, 'adhd_mitigation'), {
          email: user.email,
          gameName: 'Focus Timer',
          score: correctCount,
          timestamp: new Date(),
        });
        Alert.alert('Game Over!', `Your score: ${correctCount}/${sequence.length}`, [
          { text: 'OK', onPress: () => setGameStarted(false) },
        ]);
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  };

  const resetGame = () => {
    setSequence([]);
    setDisplaySequence([]);
    setUserSequence([]);
    setScore(0);
    setGameStarted(false);
    setGameOver(false);
  };

  return (
    <View style={styles.container}>
      {!gameStarted ? (
        <View style={styles.startContainer}>
          <Text style={styles.title}>Focus Timer Game</Text>
          <Text style={styles.instruction}>Your age: {age}</Text>
          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameContainer}>
          <Text style={styles.timer}>Memorize the sequence!</Text>
          <View style={styles.sequenceContainer}>
            {displaySequence.map((emoji, index) => (
              <Text key={index} style={styles.emoji}>
                {emoji}
              </Text>
            ))}
          </View>
          {!isFirstLoad && gameOver && (
            <View style={styles.inputContainer}>
              <Text style={styles.instruction}>Tap the emojis in the correct order:</Text>
              <View style={styles.emojiButtonsContainer}>
                {emojis.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.emojiButton}
                    onPress={() => handleEmojiTap(emoji)}
                  >
                    <Text style={styles.emoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.userSequence}>
                Your sequence: {userSequence.join(' ')}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.button} onPress={resetGame}>
            <Text style={styles.buttonText}>Reset Game</Text>
          </TouchableOpacity>
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
  startContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 18,
    marginBottom: 20,
  },
  gameContainer: {
    alignItems: 'center',
  },
  timer: {
    fontSize: 18,
    marginBottom: 20,
  },
  sequenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 40,
    margin: 10,
  },
  inputContainer: {
    alignItems: 'center',
  },
  emojiButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emojiButton: {
    margin: 5,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  userSequence: {
    fontSize: 18,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FocusTimerGame;
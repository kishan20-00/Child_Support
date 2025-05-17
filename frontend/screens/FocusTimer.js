import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';

const emojis = ['🍎', '🌳', '🚩', '🐶', '🍕', '🎈', '🚗', '📚', '⚽', '🍦'];

const FocusTimerGame = () => {
  const [age, setAge] = useState(null);
  const [sequence, setSequence] = useState([]);
  const [displaySequence, setDisplaySequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [user, setUser] = useState(null);
  const [timeStarted, setTimeStarted] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchUserAge(currentUser);
    }
  }, []);

  const fetchUserAge = async (user) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setAge(userDoc.data().age);
      } else {
        Alert.alert('Error', 'User profile not found.');
      }
    } catch (error) {
      console.error("Error fetching user age:", error);
    }
  };

  const startGame = () => {
    if (!age) {
      Alert.alert('Error', 'Age not found in profile.');
      return;
    }

    setIsFirstLoad(false);
    setTimeStarted(new Date());
    
    const userAge = Number(age);
    const numEmojis = userAge === 8 ? 4 : 7;
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
    if (userSequence.length === sequence.length && sequence.length > 0) {
      const correctEmojis = new Set(sequence);
      const userEmojis = new Set(userSequence);
      const matchedEmojis = [...userEmojis].filter((emoji) => correctEmojis.has(emoji)).length;

      setScore(matchedEmojis);
      handleGameEnd(matchedEmojis);
    }
  }, [userSequence]);

  const handleGameEnd = async (correctCount) => {
    if (!user.email) {
      console.log("User not found, cannot save result!");
      return;
    }

    const timeEnded = new Date();
    const timeTaken = timeStarted ? (timeEnded - timeStarted) / 1000 : 0;

    const userRef = doc(db, "focus_timer_game", user.email);

    try {
      const userDoc = await getDoc(userRef);
      const attempts = userDoc.exists() ? userDoc.data().attempts || [] : [];
      
      const newAttempt = {
        attempt: attempts.length + 1,
        score: correctCount,
        totalPossible: sequence.length,
        accuracy: (correctCount / sequence.length * 100).toFixed(1) + '%',
        timeTaken: timeTaken,
        age: age,
        sequenceLength: sequence.length,
        timestamp: new Date().toISOString()
      };

      await setDoc(userRef, {
        email: user.email,
        attempts: [...attempts, newAttempt],
      }, { merge: true });

      Alert.alert(
        'Game Over!',
        `You matched ${correctCount} out of ${sequence.length} emojis (${(correctCount / sequence.length * 100).toFixed(1)}%)`,
        [{ text: 'OK', onPress: () => setGameStarted(false) }]
      );
      navigation.goBack();
    } catch (error) {
      console.error("Error saving game result:", error);
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
    padding: 20
  },
  startContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  instruction: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666'
  },
  gameContainer: {
    alignItems: 'center',
    width: '100%'
  },
  timer: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333'
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
    width: '100%'
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
    color: '#333'
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    minWidth: 150,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FocusTimerGame;